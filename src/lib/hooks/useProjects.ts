'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Project {
  id: string;
  name: string;
  apiKey: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Custom hook for fetching and managing projects with React Query
 * Provides automatic caching, background refetching, and optimistic updates
 */
export function useProjects() {
  const queryClient = useQueryClient();
  
  // Fetch all projects
  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: async (): Promise<Project[]> => {
      const response = await fetch('/api/projects');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch projects');
      }
      const data = await response.json();
      return data.success ? data.data : data;
    }
  });

  // Create a new project with optimistic updates
  const createProject = useMutation({
    mutationFn: async (name: string): Promise<Project> => {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create project');
      }
      
      const data = await response.json();
      return data.data;
    },
    onSuccess: () => {
      // Invalidate and refetch projects after successful creation
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  // Delete a project with optimistic updates
  const deleteProject = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete project');
      }
    },
    onMutate: async (deletedProjectId) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ['projects'] });

      // Snapshot the previous value
      const previousProjects = queryClient.getQueryData(['projects']);

      // Optimistically remove the project from the cache
      queryClient.setQueryData(['projects'], (old: Project[] | undefined) => {
        return old ? old.filter(project => project.id !== deletedProjectId) : [];
      });

      return { previousProjects };
    },
    onError: (err, _, context) => {
      // If the mutation fails, use the context we saved to roll back
      if (context?.previousProjects) {
        queryClient.setQueryData(['projects'], context.previousProjects);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  return {
    projects,
    isLoading,
    error,
    createProject,
    deleteProject,
  };
}