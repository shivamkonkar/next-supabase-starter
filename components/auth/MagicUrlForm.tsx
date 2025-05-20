import React from 'react'; 
import { text } from 'stream/consumers';

interface MagicUrlFormProps {
  /**
   * Function to call when the form is submitted.
   * It's a form event handler.
   */
  handleMagicLinkLogin: (event: React.FormEvent<HTMLFormElement>) => void | Promise<void>;

  /**
   * Boolean indicating if the form is in a loading state (disables inputs and button).
   */
  isLoading: boolean;

  /**
   * The current value of the email input field.
   */
  email: string;

  /**
   * Function to update the email state when the input changes.
   * It receives the new email string as an argument.
   */
  setEmail: (newEmail: string) => void;


  submitButtonText: string;
}

export function MagicUrlForm({
  handleMagicLinkLogin,
  isLoading,
  email,
  setEmail,
  submitButtonText
}: MagicUrlFormProps) { // Apply the type here
  return (
    <form className="space-y-5" onSubmit={handleMagicLinkLogin}>
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60"
        >
          {isLoading ? 'Sending...' : submitButtonText}
        </button>
      </div>
    </form>
  );
}
