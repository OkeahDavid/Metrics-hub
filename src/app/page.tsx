import Link from 'next/link';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import UserNav from "@/components/auth/UserNav";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const isAuthenticated = !!session;
  
  // Get user data for UserNav if authenticated
  const user = isAuthenticated ? {
    username: session.user?.username || "User",
    isSuperUser: session.user?.isSuperUser || false
  } : null;

  return (
    <div className="bg-white">
      <header className="relative">
        <div className="bg-gray-900 pt-6">
          <nav className="relative max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6" aria-label="Global">
            <div className="flex items-center flex-1">
              <div className="flex items-center justify-between w-full">
                <h1 className="text-2xl font-bold text-white">Metrics Hub</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard" className="text-base font-medium text-white hover:text-gray-300">
                    Dashboard
                  </Link>
                  <Link href="/profile" className="text-base font-medium text-white hover:text-gray-300">
                    Profile
                  </Link>
                  {user && <UserNav user={user} theme="dark" />}
                </>
              ) : (
                <>
                  <Link href="/auth/signin" className="text-base font-medium text-white hover:text-gray-300">
                    Sign In
                  </Link>
                  <Link href="/auth/register" className="text-base font-medium text-white hover:text-gray-300">
                    Register
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>

        <div className="relative bg-gray-900 overflow-hidden">
          <div className="pt-10 pb-16 sm:pb-24">
            <div className="mt-16 mx-auto max-w-7xl px-4 sm:mt-24 sm:px-6">
              <div className="text-center">
                <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
                  <span className="block">Simple, personal</span>
                  <span className="block text-indigo-400">website analytics</span>
                </h1>
                <p className="mt-3 max-w-md mx-auto text-base text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                  Track your website metrics across multiple projects with a lightweight, 
                  privacy-focused analytics dashboard.
                </p>
                <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                  {isAuthenticated ? (
                    <>
                      <div className="rounded-md shadow">
                        <Link href="/projects/new" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10">
                          Create Project
                        </Link>
                      </div>
                      <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                        <Link href="/dashboard" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10">
                          View Dashboard
                        </Link>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="rounded-md shadow">
                        <Link href="/auth/register" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10">
                          Get Started
                        </Link>
                      </div>
                      <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                        <Link href="/auth/signin" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10">
                          Sign In
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex flex-col">
              <div className="flex-1"></div>
              <div className="flex-1 w-full bg-gray-800"></div>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Feature section */}
        <div className="py-16 bg-gray-50 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">Features</h2>
              <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
                Analytics made simple
              </p>
              <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
                Track your website metrics without the complexity.
              </p>
            </div>

            <div className="mt-12">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                <div className="pt-6">
                  <div className="flow-root bg-white rounded-lg px-6 pb-8">
                    <div className="-mt-6">
                      <div>
                        <span className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                          <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </span>
                      </div>
                      <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Track Multiple Sites</h3>
                      <p className="mt-5 text-base text-gray-500">
                        Monitor page views, referrers, and visitor statistics across all your websites.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <div className="flow-root bg-white rounded-lg px-6 pb-8">
                    <div className="-mt-6">
                      <div>
                        <span className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                          <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                          </svg>
                        </span>
                      </div>
                      <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Privacy-Focused</h3>
                      <p className="mt-5 text-base text-gray-500">
                        No cookies required, no personal data collected. Fully compliant with privacy regulations.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <div className="flow-root bg-white rounded-lg px-6 pb-8">
                    <div className="-mt-6">
                      <div>
                        <span className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                          <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                          </svg>
                        </span>
                      </div>
                      <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Simple Integration</h3>
                      <p className="mt-5 text-base text-gray-500">
                        Add a small JavaScript snippet to your website and start collecting analytics immediately.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How it works section */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">How it works</h2>
              <p className="mt-2 text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
                Three simple steps to get started
              </p>
            </div>

            <div className="mt-10">
              <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
                <div className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    <span className="text-xl font-bold">1</span>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Create a project</p>
                  <p className="mt-2 ml-16 text-base text-gray-500">
                    Set up a new project for each website you want to track.
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    <span className="text-xl font-bold">2</span>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Add the tracking code</p>
                  <p className="mt-2 ml-16 text-base text-gray-500">
                    Copy and paste the provided JavaScript snippet into your website.
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    <span className="text-xl font-bold">3</span>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">View your analytics</p>
                  <p className="mt-2 ml-16 text-base text-gray-500">
                    Access your dashboard to see real-time statistics for all your websites.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <a href="https://github.com/OkeahDavid/Metrics-hub" className="text-gray-400 hover:text-gray-300">
              <span className="sr-only">GitHub</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
          <div className="mt-8 md:mt-0 md:order-1">
            <p className="text-center text-base text-gray-400">
              &copy; 2025 Metrics Hub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}