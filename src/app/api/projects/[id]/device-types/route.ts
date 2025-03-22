import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = params.id;

    // Get project to verify it exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Get device type breakdown
    const deviceTypeData = await prisma.pageView.groupBy({
      by: ['deviceType'],
      where: {
        projectId,
        deviceType: {
          not: null,
        },
      },
      _count: true,
    });

    const deviceTypes = deviceTypeData.map(item => ({
      deviceType: item.deviceType || 'Unknown',
      count: item._count,
    }));

    // If no data with device types, provide some default categories
    if (deviceTypes.length === 0) {
      return NextResponse.json({
        deviceTypes: [
          { deviceType: 'desktop', count: 0 },
          { deviceType: 'mobile', count: 0 },
          { deviceType: 'tablet', count: 0 },
        ],
      });
    }

    return NextResponse.json({ deviceTypes });
  } catch (error) {
    console.error('Error fetching device types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch device type data' },
      { status: 500 }
    );
  }
}