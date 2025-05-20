import { AuthForm } from "@/components/auth/AuthForm";
import Crmlogo from "@/components/icons/CRMLogo";
import Link from 'next/link';


export default function Page(){

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xs w-full space-y-6">
        <div className="flex justify-center">
          <Crmlogo className="h-10 w-auto text-gray-800" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome to Acme Inc.
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
              Sign up
            </Link>
          </p>
        </div>

        <AuthForm authActionType="login" />

        <p className="mt-8 text-center text-xs text-gray-500">
          By continuing, you agree to our <br />
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

    )
}