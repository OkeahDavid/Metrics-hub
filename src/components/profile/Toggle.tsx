// components/profile/Toggle.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Toggle({ userId, isSuperUser }: { userId: string, isSuperUser: boolean }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(isSuperUser);

  const toggleSuperuser = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/users/${userId}/toggle-superuser`, {
        method: "POST",
      });
      
      if (!response.ok) {
        throw new Error("Failed to update status");
      }
      
      setCurrentStatus(!currentStatus);
      router.refresh();
    } catch (error) {
      console.error("Error toggling superuser status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={toggleSuperuser}
        disabled={isLoading}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {isLoading ? "Updating..." : currentStatus ? "Remove Superuser Status" : "Make Superuser"}
      </button>
      <p className="mt-2 text-xs text-gray-500">
        Note: This toggle is for demonstration purposes. In a production application, superuser status would be granted by an administrator.
      </p>
    </div>
  );
}