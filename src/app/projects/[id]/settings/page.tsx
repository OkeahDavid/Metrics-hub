"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ProjectSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  
  const [project, setProject] = useState<Project | null>(null);
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/projects/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch project');
        }
        
        const data = await response.json();
        setProject(data.project);
        setProjectName(data.project.name);
      } catch (err) {
        setError('Failed to load project');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProject();
    }
  }, [id]);

interface Project {
    id: string;
    name: string;
    apiKey: string;
}

interface FetchProjectResponse {
    project: Project;
}

const handleUpdateProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!projectName.trim()) {
        toast.error('Project name cannot be empty');
        return;
    }
    
    try {
        setUpdating(true);
        const response = await fetch(`/api/projects/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: projectName })
        });
        
        if (!response.ok) {
            throw new Error('Failed to update project');
        }
        
        const data: FetchProjectResponse = await response.json();
        setProject(data.project);
        toast.success('Project updated successfully');
    } catch (err) {
        toast.error('Failed to update project');
        console.error(err);
    } finally {
        setUpdating(false);
    }
};

  const handleRegenerateApiKey = async () => {
    try {
      setRegenerating(true);
      const response = await fetch(`/api/projects/${id}/regenerate-key`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to regenerate API key');
      }
      
      const data = await response.json();
      setProject(data.project);
      toast.success('API key regenerated successfully');
    } catch (err) {
      toast.error('Failed to regenerate API key');
      console.error(err);
    } finally {
      setRegenerating(false);
    }
  };

  const handleDeleteProject = async () => {
    try {
      setDeleting(true);
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete project');
      }
      
      toast.success('Project deleted successfully');
      router.push('/dashboard');
    } catch (err) {
      toast.error('Failed to delete project');
      console.error(err);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-1/4"></div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (error || !project) {
    return <div className="text-center text-red-500">{error || 'Project not found'}</div>;
  }

  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <h2 className="text-2xl font-bold mb-8">Project Settings</h2>
      
      <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Project Information</h3>
          
          <form onSubmit={handleUpdateProject}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Project Name
              </label>
              <input
                type="text"
                id="name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={updating}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {updating ? 'Updating...' : 'Update Project'}
              </button>
            </div>
          </form>
        </div>
        
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">API Key</h3>
          <p className="text-sm text-gray-500 mb-4">
            If you regenerate your API key, you will need to update the tracking code on your website.
            The old API key will stop working immediately.
          </p>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current API Key
            </label>
            <code className="block text-black bg-gray-50 p-3 rounded-md font-mono text-sm">
              {project.apiKey}
            </code>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={handleRegenerateApiKey}
              disabled={regenerating}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
            >
              {regenerating ? 'Regenerating...' : 'Regenerate API Key'}
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Danger Zone</h3>
          <p className="text-sm text-gray-500 mb-4">
            Deleting a project will remove all associated analytics data. This action cannot be undone.
          </p>
          
          {!showDeleteConfirm ? (
            <div className="flex justify-end">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete Project
              </button>
            </div>
          ) : (
            <div className="bg-red-50 p-4 rounded-md">
              <p className="text-sm text-red-700 mb-4">
                Are you sure you want to delete this project? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteProject}
                  disabled={deleting}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}