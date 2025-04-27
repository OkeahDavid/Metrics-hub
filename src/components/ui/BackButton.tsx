"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

type BackButtonProps = {
  fallbackUrl?: string;
  className?: string;
};

export default function BackButton({ fallbackUrl = "/", className = "" }: BackButtonProps) {
  const router = useRouter();
  
  // Store current path in session storage whenever component mounts
  useEffect(() => {
    // Save current path to session storage for better navigation history
    const currentPath = window.location.pathname;
    const previousPaths = JSON.parse(sessionStorage.getItem('navigationHistory') || '[]');
    
    // Only add if it's different from the last path
    if (previousPaths.length === 0 || previousPaths[previousPaths.length - 1] !== currentPath) {
      previousPaths.push(currentPath);
      sessionStorage.setItem('navigationHistory', JSON.stringify(previousPaths));
    }
  }, []);

  const handleBack = () => {
    // Try to use our session storage history first
    const previousPaths = JSON.parse(sessionStorage.getItem('navigationHistory') || '[]');
    
    if (previousPaths.length > 1) {
      // Remove current path
      previousPaths.pop();
      // Get the previous path
      const previousPath = previousPaths.pop();
      // Update storage
      sessionStorage.setItem('navigationHistory', JSON.stringify(previousPaths));
      
      // Navigate to previous path
      router.push(previousPath);
    } else if (window.history.length > 1) {
      // Fall back to browser history if our custom history isn't available
      router.back();
    } else {
      // If no history at all, go to fallback URL
      router.push(fallbackUrl);
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors ${className}`}
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