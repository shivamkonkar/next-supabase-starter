import React from 'react'; // Import React for JSX and types like MouseEventHandler

// Define a type for the Icon component.
// It should be a React component that accepts className as a prop.
// You can make this more specific if your icons always have certain props.
type IconComponent = React.ComponentType<{ className?: string }>;
// Or, if your icons are Lucide-like:
// import { LucideProps } from 'lucide-react';
// type IconComponent = React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;


// Define the props type for OAuthButton
interface OAuthButtonProps {
  /**
   * Function to call when the button is clicked.
   */
  handleClick: React.MouseEventHandler<HTMLButtonElement>;

  /**
   * Boolean indicating if the button is in a loading state (disables the button).
   */
  isLoading: boolean;

  /**
   * The Icon component to display next to the text.
   * Should accept a `className` prop.
   */
  Icon: IconComponent;

  /**
   * The text to display after "Continue with ".
   * For example, "Google", "GitHub", etc.
   */
  text: string;
}

export function OAuthButton({
  handleClick,
  isLoading,
  Icon,
  text,
}: OAuthButtonProps) { // Apply the type here
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60"
    >
      <Icon className="h-5 w-5 mr-2 text-gray-500" />
      Continue with {text}
    </button>
  );
}

// --- Example Usage (for context, not part of the component file typically) ---
// import { Github } from 'lucide-react'; // Assuming you use lucide-react

// const MyPageComponent = () => {
//   const [loading, setLoading] = React.useState(false);

//   const handleGoogleLogin = () => {
//     setLoading(true);
//     console.log('Logging in with Google...');
//     // Simulate API call
//     setTimeout(() => setLoading(false), 2000);
//   };

//   return (
//     <div>
//       <OAuthButton
//         handleClick={handleGoogleLogin}
//         isLoading={loading}
//         Icon={Github} // Or any other icon component that fits the IconComponent type
//         text="Google"
//       />
//     </div>
//   );
// };