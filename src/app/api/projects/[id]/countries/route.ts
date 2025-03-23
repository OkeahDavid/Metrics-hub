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

    // Get the top 5 countries
    const countryData = await prisma.pageView.groupBy({
      by: ['country'],
      where: {
        projectId,
        country: {
          not: null,
        },
      },
      _count: true,
    });

    // Format the data for the chart
    const countries = countryData.map(entry => ({
      country: entry.country || 'Unknown',
      count: entry._count,
    })).sort((a, b) => b.count - a.count).slice(0, 5);

    // If no data with countries, provide a default response
    if (countries.length === 0) {
      return NextResponse.json({
        countries: [],
      });
    }

    return NextResponse.json({ countries });
  } catch (error) {
    console.error('Error fetching country data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch country data' },
      { status: 500 }
    );
  }
}