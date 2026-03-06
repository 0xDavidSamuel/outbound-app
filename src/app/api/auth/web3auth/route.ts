// src/app/api/auth/web3auth/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: NextRequest) {
  try {
    const { idToken, walletAddress, userInfo } = await req.json();

    if (!walletAddress) {
      return NextResponse.json({ error: 'Missing walletAddress' }, { status: 400 });
    }

    // ── Decode token (no strict verification on devnet) ───────────────────────
    let web3authSub: string = walletAddress; // fallback

    if (idToken && idToken.split('.').length === 3) {
      try {
        const payload = JSON.parse(
          Buffer.from(idToken.split('.')[1], 'base64url').toString()
        );
        web3authSub = payload.sub || payload.email || payload.verifierId || walletAddress;
      } catch {
        // malformed token — use wallet address
        web3authSub = walletAddress;
      }
    }

    // ── Find or create Supabase user ─────────────────────────────────────────
    const email = userInfo?.email || `${web3authSub.slice(0, 16)}@outbound.wallet`;

    // Check if profile already exists for this wallet
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('wallet_address', walletAddress)
      .single();

    let supabaseUserId: string;
    let isNewUser = false;

    if (existingProfile) {
      supabaseUserId = existingProfile.id;
    } else {
      // Try to create new Supabase auth user
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          wallet_address: walletAddress,
          web3auth_sub: web3authSub,
          full_name: userInfo?.name || null,
          avatar_url: userInfo?.profileImage || null,
          provider: userInfo?.typeOfLogin || 'web3auth',
        },
      });

      if (createError) {
        // User exists with this email — find by email
        const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
        const existing = users.find(u => u.email === email);
        if (!existing) throw createError;
        supabaseUserId = existing.id;
      } else {
        supabaseUserId = newUser.user.id;
        isNewUser = true;
      }

      // Upsert profile
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

    // ── Generate magic link token for Supabase session ───────────────────────
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        data: { wallet_address: walletAddress },
      },
    });

    if (linkError) throw linkError;

    return NextResponse.json({
      success: true,
      isNewUser,
      userId: supabaseUserId,
      walletAddress,
      tokenHash: linkData.properties?.hashed_token,
      email,
    });

  } catch (error: any) {
    console.error('[web3auth bridge]', error);
    return NextResponse.json({ error: error.message || 'Auth failed' }, { status: 500 });
  }
}
