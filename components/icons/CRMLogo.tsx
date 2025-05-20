import React from 'react';

const Crmlogo = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="40" 
    height="40"
    viewBox="0 0 24 24"
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4 5C4 4.44772 4.44772 4 5 4H19C19.5523 4 20 4.44772 20 5V7H4V5ZM3 9C3 8.44772 3.44772 8 4 8H20C20.5523 8 21 8.44772 21 9V12H3V9ZM4 14H20C20.5523 14 21 14.4477 21 15V18C21 18.5523 20.5523 19 20 19H4C3.44772 19 3 18.5523 3 18V15C3 14.4477 3.44772 14 4 14Z"
    />
  </svg>
);

export default Crmlogo;