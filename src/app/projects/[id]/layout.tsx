"use client";

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import BackButton from '@/components/ui/BackButton';

export default function ProjectLayout({ children }: { children: ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const id = params.id;

  const tabs = [
    { name: 'Analytics', href: `/projects/${id}`, current: pathname === `/projects/${id}` },
    { name: 'Settings', href: `/projects/${id}/settings`, current: pathname === `/projects/${id}/settings` },
  ];

  return (
    <div>
      {/* Add Back Button */}
      <div className="mb-4">
        <BackButton fallbackUrl="/dashboard" />
      </div>
      
      <div className="sm:hidden mb-6">
        <label htmlFor="tabs" className="sr-only">
          Select a tab
        </label>
        <select
          id="tabs"
          name="tabs"
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          defaultValue={tabs.find((tab) => tab.current)?.name}
          onChange={(e) => {
            const tab = tabs.find((tab) => tab.name === e.target.value);
            if (tab) {
              window.location.href = tab.href;
            }
          }}
        >
          {tabs.map((tab) => (
            <option key={tab.name}>{tab.name}</option>
          ))}
        </select>
      </div>
      <div className="hidden sm:block mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <Link
                key={tab.name}
                href={tab.href}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${tab.current
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
                aria-current={tab.current ? 'page' : undefined}
              >
                {tab.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {children}
    </div>
  );
}