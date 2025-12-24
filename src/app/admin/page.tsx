import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/db";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminPanelClient from "@/components/admin/AdminPanelClient";

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

interface AdminData {
  users: User[];
  projects: Project[];
  stats: {
    totalUsers: number;
    totalProjects: number;
    totalPageViews: number;
  };
}

async function getAdminData(): Promise<AdminData | null> {
  try {
    // Get all users with their project counts
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        isSuperUser: true,
        lastLogin: true,
        createdAt: true,
        _count: {
          select: {
            projects: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get all projects with user information
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        apiKey: true,
        createdAt: true,
        userId: true,
        user: {
          select: {
            id: true,
            username: true,
            isSuperUser: true
          }
        },
        _count: {
          select: {
            pageViews: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get overall statistics
    const totalPageViews = await prisma.pageView.count();
    
    return {
      users,
      projects,
      stats: {
        totalUsers: users.length,
        totalProjects: projects.length,
        totalPageViews
      }
    };
  } catch (error) {
    console.error("Failed to fetch admin data:", error);
    return null;
  }
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminPanel() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  if (!session.user.isSuperUser) {
    redirect("/dashboard");
  }

  const adminData = await getAdminData();

  if (!adminData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">
            Failed to load admin data
          </h1>
          <Link
            href="/dashboard"
            className="mt-4 inline-block text-blue-500 hover:underline"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Admin Panel
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage users, projects, and view system statistics
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Users
          </h3>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {adminData.stats.totalUsers}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Projects
          </h3>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {adminData.stats.totalProjects}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Page Views
          </h3>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {adminData.stats.totalPageViews.toLocaleString()}
          </p>
        </div>
      </div>

      <AdminPanelClient users={adminData.users} projects={adminData.projects} />
    </div>
  );
}
