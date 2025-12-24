'use client';

import { useState, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import ToggleSuperUserButton from './ToggleSuperUserButton';
import DeleteButton from './DeleteButton';
import Link from 'next/link';

interface User {
  id: string;
  username: string;
  isSuperUser: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  _count: {
    projects: number;
  };
}

interface Project {
  id: string;
  name: string;
  apiKey: string;
  createdAt: Date;
  userId: string | null;
  user: {
    id: string;
    username: string;
    isSuperUser: boolean;
  } | null;
  _count: {
    pageViews: number;
  };
}

interface AdminPanelClientProps {
  users: User[];
  projects: Project[];
}

export default function AdminPanelClient({ users, projects }: AdminPanelClientProps) {
  const [userSearch, setUserSearch] = useState('');
  const [projectSearch, setProjectSearch] = useState('');
  const [userFilter, setUserFilter] = useState<'all' | 'admin' | 'regular'>('all');

  // Filter and search users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.username.toLowerCase().includes(userSearch.toLowerCase());
      const matchesFilter = 
        userFilter === 'all' ||
        (userFilter === 'admin' && user.isSuperUser) ||
        (userFilter === 'regular' && !user.isSuperUser);
      return matchesSearch && matchesFilter;
    });
  }, [users, userSearch, userFilter]);

  // Filter and search projects
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      return project.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
             project.user?.username.toLowerCase().includes(projectSearch.toLowerCase());
    });
  }, [projects, projectSearch]);

  return (
    <>
      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Users
            </h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Search users..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <select
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value as 'all' | 'admin' | 'regular')}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="all">All Users</option>
                <option value="admin">Admins Only</option>
                <option value="regular">Regular Users</option>
              </select>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Projects
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.username}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {user._count.projects}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.isSuperUser
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {user.isSuperUser ? "Super User" : "User"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {user.lastLogin ? (
                      formatDistanceToNow(new Date(user.lastLogin), {
                        addSuffix: true,
                      })
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500">Never</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(new Date(user.createdAt), {
                      addSuffix: true,
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <ToggleSuperUserButton
                      userId={user.id}
                      isSuperUser={user.isSuperUser}
                      username={user.username}
                    />
                    <DeleteButton
                      id={user.id}
                      name={user.username}
                      type="user"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No users found
            </div>
          )}
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Projects
            </h2>
            <input
              type="text"
              placeholder="Search projects or owners..."
              value={projectSearch}
              onChange={(e) => setProjectSearch(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Project Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Page Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredProjects.map((project) => (
                <tr key={project.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {project.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {project.user?.username || "Unassigned"}
                      {project.user?.isSuperUser && (
                        <span className="ml-2 text-xs text-purple-600 dark:text-purple-400">
                          (Admin)
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {project._count.pageViews.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(new Date(project.createdAt), {
                      addSuffix: true,
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link
                      href={`/projects/${project.id}`}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      View
                    </Link>
                    <DeleteButton
                      id={project.id}
                      name={project.name}
                      type="project"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProjects.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No projects found
            </div>
          )}
        </div>
      </div>
    </>
  );
}
