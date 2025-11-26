
import React from 'react';

interface KristalLogoProps {
  size?: number;
  className?: string;
}

export const KristalLogo: React.FC<KristalLogoProps> = ({ size = 28, className = "" }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Main diamond shape body */}
      <path 
        d="M12 22L2.5 9L7 2H17L21.5 9L12 22Z" 
        fill="#5865F2" 
        fillOpacity="0.2"
        stroke="white" 
        strokeWidth="1.5" 
        strokeLinejoin="round"
      />
      
      {/* Internal facets for brilliance */}
      <path d="M2.5 9H21.5" stroke="white" strokeWidth="1" strokeLinecap="round" />
      <path d="M7 2L12 9L17 2" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 2L2.5 9L12 22" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 2L21.5 9L12 22" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 9V22" stroke="white" strokeWidth="1" strokeLinecap="round" />
      
      {/* Shine effect */}
      <circle cx="17" cy="5" r="1" fill="white" fillOpacity="0.8" />
    </svg>
  );
};
