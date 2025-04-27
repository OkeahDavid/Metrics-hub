"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import UserNav from '@/components/auth/UserNav';
import { useSession } from 'next-auth/react';

export default function GlobalNav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = useSession();
  
  // Don't show navigation on auth pages
  if (pathname?.startsWith('/auth/')) {
    return null;
  }
  
  // Skip rendering nav if no session yet
  if (!session) {
    return null; // Or you could return a loading state
  }
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Define navigation links
  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/projects/new', label: 'New Project' },
    { href: '/profile', label: 'Profile' },
  ];
  
  // Helper function to check if a link is active
  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname?.startsWith(path);
  };

  // Prepare user data for UserNav
  const user = {
    username: session?.user?.username || session?.user?.name || "User",
    isSuperUser: session?.user?.isSuperUser || false
  };

  return (
    <nav className="bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <h1 className="text-gray-100 text-xl font-bold">Metrics Hub</h1>
              </Link>
            </div>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                {navLinks.map((link) => (
                  <Link 
                    key={link.href}
                    href={link.href} 
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive(link.href)
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <UserNav user={user} theme="dark" />
            </div>
          </div>
          
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={toggleMobileMenu}
              type="button"
              className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded={mobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {!mobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive(link.href)
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-700">
            <div className="px-2">
              <UserNav user={user} theme="dark" />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}