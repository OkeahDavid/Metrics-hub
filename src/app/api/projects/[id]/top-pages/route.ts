// app/api/projects/[id]/top-pages/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { subDays } from 'date-fns';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Get project to verify it exists
    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const daysParam = searchParams.get('days');
    const days = daysParam ? parseInt(daysParam, 10) : 7;

    // Calculate date range
    const startDate = subDays(new Date(), days);
    
    // Group by page path and count
    const pageData = await prisma.pageView.groupBy({
      by: ['page'],
      where: {
        projectId: id,
        createdAt: {
          gte: startDate,
        },
      },
      _count: {
        page: true,
      },
    });

    // Get total page views for percentage calculation
    const totalViews = await prisma.pageView.count({
      where: {
        projectId: id,
        createdAt: {
          gte: startDate,
        },
      },
    });

    // Format and sort the data
    const pages = pageData
      .map(item => ({
        path: item.page,
        count: item._count.page,
        percentage: (item._count.page / totalViews) * 100,
      }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({ pages });
  } catch (error) {
    console.error('Error fetching top pages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch page data' },
      { status: 500 }
    );
  }
}