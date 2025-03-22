import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { subMinutes } from 'date-fns';

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

    // Consider a session "live" if it had activity in the last 5 minutes
    const fiveMinutesAgo = subMinutes(new Date(), 5);
    
    // Get unique sessions with activity in the last 5 minutes
    const uniqueSessions = await prisma.pageView.findMany({
      where: {
        projectId: id,
        createdAt: {
          gte: fiveMinutesAgo,
        },
      },
      distinct: ['sessionId'],
      select: {
        sessionId: true,
      },
    });

    return NextResponse.json({ count: uniqueSessions.length });
  } catch (error) {
    console.error('Error fetching live visitors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch live visitors data' },
      { status: 500 }
    );
  }
}