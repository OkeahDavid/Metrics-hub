'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { toast } from 'react-toastify';
import ConfirmDialog from './ConfirmDialog';

interface ToggleSuperUserButtonProps {
  userId: string;
  isSuperUser: boolean;
  username: string;
}

export default function ToggleSuperUserButton({
  userId,
  isSuperUser,
  username,
}: ToggleSuperUserButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { data: session } = useSession();
  
  const isSelf = session?.user?.id === userId;

  const handleToggle = () => {
    setShowConfirm(true);
  };

  const confirmToggle = async () => {
    setShowConfirm(false);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/users/${userId}/toggle-superuser`, {
        method: 'POST',
        cache: 'no-store',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update user');
      }

      // If removing own admin access, sign out and redirect to dashboard
      if (isSelf && isSuperUser) {
        toast.success('Admin access removed. Redirecting...', { autoClose: 1500 });
        setTimeout(async () => {
          await signOut({ redirect: true, callbackUrl: '/dashboard' });
        }, 1500);
        return;
      }

      // Show success message
      toast.success(
        isSuperUser 
          ? `Admin access revoked from ${username}` 
          : `${username} is now an admin`,
        { autoClose: 3000 }
      );

      // Force a hard refresh to update the page data
      router.refresh();
      
      // Also force a reload if nothing happens after 500ms
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading
          ? 'Updating...'
          : isSuperUser
          ? 'Revoke Admin'
          : 'Make Admin'}
      </button>
      
      {showConfirm && (
        <ConfirmDialog
          message={
            isSelf && isSuperUser
              ? 'Are you sure you want to remove your own admin access? You will be signed out and redirected to the dashboard.'
              : `Are you sure you want to ${
                  isSuperUser ? 'revoke admin access from' : 'grant admin access to'
                } ${username}?`
          }
          onConfirm={confirmToggle}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}
