"use client";

import { useRouter } from "next/navigation";

type BackButtonProps = {
  fallbackUrl?: string;
  className?: string;
};

export default function BackButton({ fallbackUrl = "/", className = "" }: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    // Try to go back in history first
    if (window.history.length > 1) {
      router.back();
    } else {
      // If no history, go to fallback URL (home page)
      router.push(fallbackUrl);
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`flex items-center text-gray-600 hover:text-gray-900 transition-colors ${className}`}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor" 
        className="w-5 h-5 mr-1"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
      </svg>
      Back
    </button>
  );
}