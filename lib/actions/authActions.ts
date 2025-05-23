'use server'

import { createClient } from '@/lib/supabase/server'

export interface AuthActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function sendMagicLink(formData: FormData): Promise<AuthActionResult> {
  const supabase = await createClient();
  const email = formData.get('email') as string;
  const authActionType = formData.get('authActionType') as 'login' | 'signup';

  if (!email) {
    return { success: false, error: 'Email is required.' };
  }

  if (!authActionType) {
    return { success: false, error: 'Auth action type is required.' };
  }

  const redirectTo = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`;

  const { error } = await supabase.auth.signInWithOtp({
    email: email,
    options: {
      emailRedirectTo: redirectTo,
      shouldCreateUser: authActionType === 'signup',
    },
  });

  if (error) {
    return { success: false, error: `Failed to send ${authActionType === 'signup' ? 'signup' : 'login'} link: ${error.message}` };
  }
  return { success: true, message: `Login link sent to ${email}. Please check your inbox.` };
}

// --- OAuth Actions ---

export interface OAuthSignInResult extends AuthActionResult {
  url?: string | null; // URL for client-side redirection
}


async function generateOAuthSignInUrl(provider: 'google') {
  const supabase = await createClient();
  const redirectTo = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: redirectTo,
    },
  });

  if (error) {
    console.error(`OAuth Error (${provider}):`, error);
    return { success: false, error: `Failed to initiate ${provider} sign-in: ${error.message}` };
  }

  if (!data.url) {
    return { success: false, error: `Could not get ${provider} sign-in URL.` };
  }

  return { success: true, url: data.url };
}

export async function signInWithGoogle() {
  return generateOAuthSignInUrl('google');
}