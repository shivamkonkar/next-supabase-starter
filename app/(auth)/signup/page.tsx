

import React from 'react';
import Link from 'next/link';
import Crmlogo from '@/components/icons/CRMLogo';
import { AuthForm } from '@/components/auth/AuthForm';

export default function SignUpPage() {


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xs w-full space-y-6">
        <div className="flex justify-center">
          <Crmlogo className="h-10 w-auto text-gray-800" />
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Create your Acme account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Log in
            </Link>
          </p>
        </div>

        <AuthForm
          authActionType="signup" 
        />

        <p className="mt-8 text-center text-xs text-gray-500">
          By creating an account, you agree to our <br />
          <Link href="/terms" className="font-medium text-gray-700 hover:text-gray-900 underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="font-medium text-gray-700 hover:text-gray-900 underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}