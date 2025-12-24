'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import ConfirmDialog from './ConfirmDialog';

interface DeleteButtonProps {
  id: string;
  name: string;
  type: 'user' | 'project';
}

export default function DeleteButton({ id, name, type }: DeleteButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () => {
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    setShowConfirm(false);
    setIsLoading(true);

    try {
      const endpoint = type === 'user' 
        ? `/api/users/${id}/delete` 
        : `/api/projects/${id}/delete`;
      
      const response = await fetch(endpoint, {
        method: 'DELETE',
        cache: 'no-store',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to delete ${type}`);
      }

      toast.success(
        `${type === 'user' ? 'User' : 'Project'} "${name}" deleted successfully`,
        { autoClose: 3000 }
      );

      // Refresh the page
      router.refresh();
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Failed to delete ${type}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleDelete}
        disabled={isLoading}
        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed ml-3"
      >
        {isLoading ? 'Deleting...' : 'Delete'}
      </button>
      
      {showConfirm && (
        <ConfirmDialog
          message={`Are you sure you want to delete ${type} "${name}"? This action cannot be undone and will delete all associated data.`}
          onConfirm={confirmDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}
