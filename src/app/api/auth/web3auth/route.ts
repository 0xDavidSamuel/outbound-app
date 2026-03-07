// src/app/api/auth/web3auth/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://outbound.vercel.app';

export async function POST(req: NextRequest) {
  try {
    const { idToken, walletAddress, userInfo } = await req.json();
    if (!walletAddress) {
      return NextResponse.json({ error: 'Missing walletAddress' }, { status: 400 });
    }

    // ── Decode Web3Auth token ─────────────────────────────────────────────
    let web3authSub: string = walletAddress;
    if (idToken && idToken.split('.').length === 3) {
      try {
        const payload = JSON.parse(
          Buffer.from(idToken.split('.')[1], 'base64url').toString()
        );
        web3authSub = payload.sub || payload.email || payload.verifierId || walletAddress;
      } catch {
        web3authSub = walletAddress;
      }
    }

    // ── Find or create Supabase user ──────────────────────────────────────
    const incomingEmail = userInfo?.email ||
      `${web3authSub.replace(/[^a-z0-9]/gi, '').slice(0, 16)}@outbound.wallet`;

    let supabaseUserId: string;
    let email: string = incomingEmail;
    let isNewUser = false;

    // 1. Check if a profile already exists for this wallet
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('wallet_address', walletAddress)
      .single();

    if (existingProfile) {
      // Profile exists — look up the auth user to get their actual email
      supabaseUserId = existingProfile.id;
      const { data: { user: authUser } } = await supabaseAdmin.auth.admin.getUserById(supabaseUserId);
      if (authUser?.email) {
        email = authUser.email; // Use the email tied to this auth user
      }
    } else {
      // 2. No profile — check if auth user exists with this email
      const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
      const existingAuthUser = users.find(u => u.email === incomingEmail);

      if (existingAuthUser) {
        supabaseUserId = existingAuthUser.id;
        email = existingAuthUser.email!;
      } else {
        // 3. Brand new user — create auth user + profile
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: incomingEmail,
          email_confirm: true,
          user_metadata: {
            wallet_address: walletAddress,
            web3auth_sub: web3authSub,
            full_name: userInfo?.name || null,
            avatar_url: userInfo?.profileImage || null,
            provider: userInfo?.typeOfLogin || 'web3auth',
          },
        });
        if (createError) throw createError;
        supabaseUserId = newUser.user.id;
        email = incomingEmail;
        isNewUser = true;
      }

      // Upsert profile for new or previously auth-only users
      await supabaseAdmin.from('profiles').upsert({
        id: supabaseUserId,
        wallet_address: walletAddress,
        full_name: userInfo?.name || null,
        avatar_url: userInfo?.profileImage || null,
        login_provider: userInfo?.typeOfLogin || 'web3auth',
        web3auth_sub: web3authSub,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
    }

    // ── Generate magic link ───────────────────────────────────────────────
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo: `${APP_URL}/auth/session` },
    });
    if (linkError) throw linkError;

    return NextResponse.json({
      success: true,
      isNewUser,
      userId: supabaseUserId,
      walletAddress,
      email,
      actionLink: linkData.properties.action_link,
    });

  } catch (error: any) {
    console.error('[web3auth bridge]', error);
    return NextResponse.json({ error: error.message || 'Auth failed' }, { status: 500 });
  }
}
