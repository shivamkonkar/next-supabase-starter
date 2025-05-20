import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server'; 
import React from 'react';


export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const supabase = await createClient(); 
  const { data: { user }, error: sessionError } = await supabase.auth.getUser();

  if (sessionError) {
    console.error("Error fetching user session in ProtectedLayout:", sessionError.message);

    const loginUrl = new URL('/login', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');
    loginUrl.searchParams.set('error', 'session_retrieval_failed');
    redirect(loginUrl.pathname + loginUrl.search);
  }

  if (!user) {

    const loginUrl = new URL('/login', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');
    redirect(loginUrl.pathname + loginUrl.search);
  }



  return (
    <>
      <main className="protected-layout-main"> 
        {children}
      </main>
    </>
  );
}