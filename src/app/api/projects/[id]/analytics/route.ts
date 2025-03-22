// app/api/projects/[id]/analytics/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const daysParam = searchParams.get('days');
    const days = daysParam ? parseInt(daysParam, 10) : 7;

    // Get project to verify it exists
    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Calculate date range
    const endDate = new Date();
    const dailyPageViews = [];
    
    for (let i = 0; i < days; i++) {
      const date = subDays(endDate, i);
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      const count = await prisma.pageView.count({
        where: {
          projectId: id,
          createdAt: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
      });
      
      dailyPageViews.unshift({
        date: formattedDate,
        count,
      });
    }

    return NextResponse.json({ dailyPageViews });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}