import prisma from '@/lib/db';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { JSX } from 'react';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from 'next/navigation';
import UserNav from '@/components/auth/UserNav';

interface Project {
  id: string;
  name: string;
  apiKey: string;
  createdAt: Date;
}

export default async function DashboardPage(): Promise<JSX.Element> {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/signin');
  }

  let projects: Project[] = [];
  let totalStats: { _count: { id: number } } = { _count: { id: 0 } };
  let last24HoursStats = 0;

  try {
    // Get user-specific projects (or all if superuser)
    projects = await prisma.project.findMany({
      where: session.user.isSuperUser
        ? {}
        : { userId: session.user.id as string }, // Ensure userId is cast to string
      orderBy: { createdAt: 'desc' },
    });

    // Query conditions for page views based on project IDs
    const projectIds = projects.map(project => project.id);
    const pageViewCondition = projectIds.length > 0 
      ? { projectId: { in: projectIds } } 
      : undefined;

    // Get total stats for user's projects only
    if (pageViewCondition) {
      totalStats = await prisma.pageView.aggregate({
        _count: { id: true },
        where: pageViewCondition
      });

      // Get last 24 hours stats for user's projects
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      last24HoursStats = await prisma.pageView.count({
        where: {
          ...pageViewCondition,
          createdAt: {
            gte: yesterday,
          },
        },
      });
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-100 sm:text-3xl sm:truncate">
            Dashboard
          </h2>
          {session.user.isSuperUser && (
            <p className="text-sm text-indigo-400 mt-1">Superuser Mode - Viewing All Projects</p>
          )}
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 gap-4 items-center">
          <UserNav user={session.user} theme="dark" />
          <Link
            href="/projects/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create New Project
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800 shadow rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-200">Total Projects</h3>
          <p className="mt-1 text-3xl font-semibold text-indigo-400">{projects.length}</p>
        </div>
        <div className="bg-gray-800 shadow rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-200">Total Page Views</h3>
          <p className="mt-1 text-3xl font-semibold text-indigo-400">{totalStats._count.id || 0}</p>
        </div>
        <div className="bg-gray-800 shadow rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-200">Last 24 Hours</h3>
          <p className="mt-1 text-3xl font-semibold text-indigo-400">{last24HoursStats}</p>
        </div>
      </div>

      <div className="bg-gray-800 shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-700">
          {projects.length === 0 ? (
            <li className="px-6 py-4 text-center text-gray-400">
              No projects yet. Create your first project to start tracking.
            </li>
          ) : (
            projects.map((project) => (
              <li key={project.id}>
                <Link href={`/projects/${project.id}`} className="block hover:bg-gray-700">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-indigo-400 truncate">
                        {project.name}
                      </p>
                      <div className="flex-shrink-0">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-900 text-green-200">
                          Active
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-400">
                          API Key: <code className="ml-1 font-mono bg-gray-700 px-1 py-0.5 rounded text-gray-200">{project.apiKey.substring(0, 8)}...</code>
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-400 sm:mt-0">
                        <p>
                          Created {formatDistanceToNow(new Date(project.createdAt))} ago
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}