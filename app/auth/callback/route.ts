// src/app/auth/callback/route.ts
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server' // Your server-side Supabase client
import { revalidatePath } from 'next/cache'; // Import revalidatePath

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  console.log(code)
  const next = requestUrl.searchParams.get('next') || '/dashboard'; // Where to redirect after success

  if (code) {
    const supabase = await createClient(); // Correctly awaits your async client creation
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {

      revalidatePath('/', 'layout');
      const redirectBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      return NextResponse.redirect(new URL(next, redirectBaseUrl).toString());
    } else {
      console.error("Auth Callback - Error exchanging code for session:", exchangeError.message);

      const errorRedirectUrl = new URL('/login', process.env.NEXT_PUBLIC_BASE_URL);
      errorRedirectUrl.searchParams.set('error', 'authentication_failed'); // Generic error key
      errorRedirectUrl.searchParams.set('details', exchangeError.message); // More details if you choose to pass them (be cautious)
      return NextResponse.redirect(errorRedirectUrl.toString());
    }
  } else {
    console.warn("Auth Callback - No 'code' parameter found in URL.");
  }


  const fallbackErrorUrl = new URL('/login', process.env.NEXT_PUBLIC_BASE_URL);
  fallbackErrorUrl.searchParams.set('error', 'Invalid login link or link expired.');
  return NextResponse.redirect(fallbackErrorUrl.toString());
}