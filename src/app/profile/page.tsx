import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import Toggle from "@/components/profile/Toggle";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/signin');
  }

  // Get full user details
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    redirect('/dashboard');
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-100">User Profile</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-400">Account details and settings</p>
        </div>
        <div className="border-t border-gray-700">
          <dl>
            <div className="bg-gray-700 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-300">Username</dt>
              <dd className="mt-1 text-sm text-gray-100 sm:mt-0 sm:col-span-2">{user.username}</dd>
            </div>
            <div className="bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-300">Account status</dt>
              <dd className="mt-1 text-sm text-gray-100 sm:mt-0 sm:col-span-2">
                {user.isSuperUser ? (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-900 text-indigo-200">
                    Superuser
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-900 text-green-200">
                    Standard User
                  </span>
                )}
              </dd>
            </div>
            
            {/* Toggle superuser status (demo purposes only) */}
            <div className="bg-gray-700 px-4 py-5 sm:px-6">
              <Toggle userId={user.id} isSuperUser={user.isSuperUser} />
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}