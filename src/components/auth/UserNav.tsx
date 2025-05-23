"use client";

import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { signOut } from 'next-auth/react';

interface User {
  username: string;
  isSuperUser: boolean;
}

export default function UserNav({ user, theme = 'light' }: { user: User; theme?: 'light' | 'dark' }) {
  // Use more consistent text colors based on our global theme
  const textColorClass = theme === 'dark' 
    ? "text-gray-100 hover:text-white" 
    : "text-gray-800 hover:text-gray-900";

  return (
    <Menu as="div" className="relative ml-3">
      <div>
        <Menu.Button className={`flex items-center gap-x-1 text-base font-medium ${textColorClass}`}>
          {user.username}
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:ring-gray-700">
          {user.isSuperUser && (
            <Menu.Item>
              {({ active }) => (
                <span className={`block px-4 py-2 text-sm ${active ? 'bg-gray-100 dark:bg-gray-700' : ''} text-indigo-600 dark:text-indigo-400 font-medium`}>
                  Superuser
                </span>
              )}
            </Menu.Item>
          )}
          <Menu.Item>
            {({ active }) => (
              <a
                href="/profile"
                className={`block px-4 py-2 text-sm ${active ? 'bg-gray-100 dark:bg-gray-700' : ''} text-gray-700 dark:text-gray-300`}
              >
                Your Profile
              </a>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className={`block w-full text-left px-4 py-2 text-sm ${active ? 'bg-gray-100 dark:bg-gray-700' : ''} text-gray-700 dark:text-gray-300`}
              >
                Sign out
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}