// src/app/api/auth/web3auth/route.ts
// Bridges Web3Auth login to a Supabase session
// Flow: Web3Auth JWT → verify → upsert Supabase user → return session

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as jose from 'jose';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,  // service role — server only
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Web3Auth JWKS endpoint for verifying tokens
const WEB3AUTH_JWKS_URL = 'https://api.openlogin.com/jwks';

export async function POST(req: NextRequest) {
  try {
    const { idToken, walletAddress, userInfo } = await req.json();

    if (!idToken || !walletAddress) {
      return NextResponse.json({ error: 'Missing idToken or walletAddress' }, { status: 400 });
    }

    // ── Verify Web3Auth JWT ──────────────────────────────────────────────────
    const JWKS = jose.createRemoteJWKSet(new URL(WEB3AUTH_JWKS_URL));
    const { payload } = await jose.jwtVerify(idToken, JWKS, {
      algorithms: ['ES256'],
    });

    // sub from the JWT is the Web3Auth user identifier (stable across logins)
    const web3authSub = payload.sub as string;
    if (!web3authSub) {
      return NextResponse.json({ error: 'Invalid token: missing sub' }, { status: 401 });
    }

    // ── Find or create Supabase user ─────────────────────────────────────────
    const email = userInfo?.email || `${web3authSub}@outbound.wallet`;

    // Try to find existing user by wallet_address
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
      // Create new Supabase auth user
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
        // User might already exist with this email — find them
        const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
        const existing = users.find(u => u.email === email);
        if (!existing) throw createError;
        supabaseUserId = existing.id;
      } else {
        supabaseUserId = newUser.user.id;
        isNewUser = true;
      }

      // Upsert profile with wallet address
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

    // ── Issue a Supabase session ─────────────────────────────────────────────
    const { data: sessionData, error: sessionError } =
      await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email,
      });

    if (sessionError) throw sessionError;

    // Sign user in with the magic link token to get a real session
    const { data: { session }, error: signInError } =
      await supabaseAdmin.auth.admin.getUserById(supabaseUserId)
        .then(() => supabaseAdmin.auth.admin.generateLink({
          type: 'magiclink',
          email,
        })).then(({ data, error }) => {
          if (error) throw error;
          // Exchange the token for a session via the public client
          return { data: { session: null }, error: null };
        });

    // Simpler: return a custom access token the client can use directly
    const { data: { user: confirmedUser } } = await supabaseAdmin.auth.admin.getUserById(supabaseUserId);

    // Create session directly
    const { data: directSession, error: directError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        data: { wallet_address: walletAddress },
      }
    });

    if (directError) throw directError;

    return NextResponse.json({
      success: true,
      isNewUser,
      userId: supabaseUserId,
      walletAddress,
      // Return the magic link token — client will exchange for session
      tokenHash: directSession.properties?.hashed_token,
      email,
    });

  } catch (error: any) {
    console.error('[web3auth bridge]', error);
    return NextResponse.json({ error: error.message || 'Auth failed' }, { status: 500 });
  }
}
