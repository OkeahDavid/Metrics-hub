import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { subDays } from 'date-fns';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Properly await the params before accessing
    const { id } = await params;
    
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
    
    // Group by referrer and count
    const referrerData = await prisma.pageView.groupBy({
      by: ['referrer'],
      where: {
        projectId: id,
        createdAt: {
          gte: startDate,
        },
      },
      _count: {
        referrer: true,
      },
    });

    // Format the data
    const referrers = referrerData.map(item => ({
      referrer: item.referrer || 'Direct',
      count: item._count.referrer,
    }));

    return NextResponse.json({ referrers });
  } catch (error) {
    console.error('Error fetching referrers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch referrer data' },
      { status: 500 }
    );
  }
}