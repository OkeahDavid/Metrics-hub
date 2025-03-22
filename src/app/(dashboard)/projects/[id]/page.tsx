import { notFound } from 'next/navigation';
import prisma from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import PageViewsChart from '@/components/analytics/PageViewsChart';
import DeviceTypeChart from '@/components/analytics/DeviceTypeChart';

export default async function ProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return notFound();
  }

  const project = await prisma.project.findUnique({
    where: { id: params.id },
  });

  if (!project) {
    return notFound();
  }

  // Get total page views
  const totalPageViews = await prisma.pageView.count({
    where: { projectId: project.id },
  });

  // Get views for the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const recentPageViews = await prisma.pageView.count({
    where: {
      projectId: project.id,
      createdAt: {
        gte: sevenDaysAgo,
      },
    },
  });

  // Get top pages
  const topPages = await prisma.pageView.groupBy({
    by: ['page'],
    where: { projectId: project.id },
    _count: { page: true },
    orderBy: {
      _count: {
        page: 'desc',
      },
    },
    take: 5,
  });

  // Get top referrers
  const topReferrers = await prisma.pageView.groupBy({
    by: ['referrer'],
    where: { 
      projectId: project.id,
      referrer: {
        not: null,
      },
    },
    _count: { referrer: true },
    orderBy: {
      _count: {
        referrer: 'desc',
      },
    },
    take: 5,
  });

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            {project.name}
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <a
            href="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Dashboard
          </a>
        </div>
      </div>

      <div className="mt-4">
        <div className="bg-white shadow sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Integration</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>Add this script to your website to start tracking:</p>
            </div>
            <div className="mt-3">
              <div className="bg-gray-100 p-4 rounded overflow-x-auto">
                <code className="text-sm">
                  {`<script async src="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/tracking-script?apiKey=${project.apiKey}"></script>`}
                </code>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white shadow overflow-hidden sm:rounded-md p-6">
            <div className="text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Total Views</h3>
              <p className="mt-2 text-3xl font-semibold text-indigo-600">{totalPageViews}</p>
            </div>
          </div>
          
          <div className="bg-white shadow overflow-hidden sm:rounded-md p-6">
            <div className="text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Last 7 Days</h3>
              <p className="mt-2 text-3xl font-semibold text-indigo-600">{recentPageViews}</p>
            </div>
          </div>
          
          <div className="bg-white shadow overflow-hidden sm:rounded-md p-6">
            <div className="text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">API Key</h3>
              <p className="mt-2 text-sm bg-gray-100 p-2 rounded">
                {project.apiKey}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <PageViewsChart projectId={project.id} />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Top Pages</h3>
              <div className="mt-4">
                {topPages.length === 0 ? (
                  <p className="text-sm text-gray-500">No page views recorded yet.</p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {topPages.map((item) => (
                      <li key={item.page} className="py-3 flex justify-between">
                        <span className="text-sm text-gray-500 truncate">{item.page}</span>
                        <span className="text-sm font-medium text-gray-900">{item._count.page} views</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div>
            <DeviceTypeChart projectId={project.id} />
          </div>
        </div>

        <div className="mt-6 bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Top Referrers</h3>
            <div className="mt-4">
              {topReferrers.length === 0 ? (
                <p className="text-sm text-gray-500">No referrer data recorded yet.</p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {topReferrers.map((item) => (
                    <li key={item.referrer} className="py-3 flex justify-between">
                      <span className="text-sm text-gray-500 truncate">{item.referrer}</span>
                      <span className="text-sm font-medium text-gray-900">{item._count.referrer} views</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}