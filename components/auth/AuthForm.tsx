"use client"; 

import GoogleIcon from "@/components/icons/GoogleIcon"; 
import { useState } from "react"; 
import React from "react"; 
import { OAuthButton } from "@/components/auth/OAuthButton"; 
import { MagicUrlForm } from "./MagicUrlForm"; 
import { sendMagicLink, AuthActionResult, signInWithGoogle, OAuthSignInResult } from '@/lib/actions/authActions';


interface AuthFormProps{
    authActionType: 'login' | 'signup'
}

export function AuthForm({authActionType}: AuthFormProps ) {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);  
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');


  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEmailLoading(true);
    setMessage('');
    setError('');

    const formData = new FormData();
    formData.append('email', email);

    const result: AuthActionResult = await sendMagicLink(formData);

    if (result.success) {
      setMessage(result.message || 'Login link sent!');
      setEmail(''); 
    } else {
      setError(result.error || 'An error occurred.');
    }
    setEmailLoading(false);
  };

  const handleGoogleSignIn = async () =>{
    setGoogleLoading(true)
    const result: OAuthSignInResult = await signInWithGoogle()
    if (result.success && result.url) {
      window.location.href = result.url; // Redirect to Google
    } else {
      console.error("Google Sign-In Error:", result.error);
      setGoogleLoading(false);
    }
  }

  return (
    <div className="space-y-6"> 
      <MagicUrlForm
        handleMagicLinkLogin={handleEmailSubmit} 
        isLoading={emailLoading} 
        email={email}
        setEmail={setEmail}
        submitButtonText= {authActionType=="login"?"Login with Email":"Sign up with Email"}
      />
      <div className="my-4 text-green-800 text-sm">
        {message === ""?null:message}
      </div>
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <OAuthButton
        handleClick={handleGoogleSignIn}
        isLoading={googleLoading} 
        Icon={GoogleIcon}
        text="Google"
      />
    </div>
  );
}