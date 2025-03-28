import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Await params before destructuring
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const projectId = id;
    
    // Get project to verify it exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    console.log("Fetching device types for project:", projectId);

    // Get all pageviews to debug
    const allPageViews = await prisma.pageView.findMany({
      where: {
        projectId,
      },
      select: {
        deviceType: true,
        id: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10, // Get the latest 10 for debugging
    });
    
    console.log("Latest page views:", allPageViews);

    // Get device type breakdown
    const deviceTypeData = await prisma.pageView.groupBy({
      by: ['deviceType'],
      where: {
        projectId,
      },
      _count: true,
    });

    console.log("Device type data from DB:", deviceTypeData);

    const deviceTypes = deviceTypeData.map(item => ({
      deviceType: item.deviceType || 'Unknown',
      count: item._count,
    }));

    // If no data with device types, provide some default categories
    if (deviceTypes.length === 0) {
      console.log("No device types found, returning defaults");
      return NextResponse.json({
        deviceTypes: [
          { deviceType: 'desktop', count: 0 },
          { deviceType: 'mobile', count: 0 },
          { deviceType: 'tablet', count: 0 },
        ],
      });
    }

    // Ensure we always have all three device types in the response
    const finalDeviceTypes = [...deviceTypes];
    const deviceTypeMap: Record<string, boolean> = deviceTypes.reduce((acc: Record<string, boolean>, item) => {
      acc[item.deviceType] = true;
      return acc;
    }, {});

    if (!deviceTypeMap['desktop']) {
      finalDeviceTypes.push({ deviceType: 'desktop', count: 0 });
    }
    if (!deviceTypeMap['mobile']) {
      finalDeviceTypes.push({ deviceType: 'mobile', count: 0 });
    }
    if (!deviceTypeMap['tablet']) {
      finalDeviceTypes.push({ deviceType: 'tablet', count: 0 });
    }

    console.log("Final device types to return:", finalDeviceTypes);

    return new NextResponse(
      JSON.stringify({ deviceTypes: finalDeviceTypes }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, max-age=0' // Prevent caching
        }
      }
    );
  } catch (error) {
    console.error('Error fetching device types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch device type data' },
      { status: 500 }
    );
  }
}