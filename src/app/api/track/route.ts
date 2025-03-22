import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { page, referrer, projectApiKey, sessionId, userAgent } = data;

    // Validate API key
    const project = await prisma.project.findUnique({
      where: { apiKey: projectApiKey }
    });

    if (!project) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    // Store the page view
    await prisma.pageView.create({
      data: {
        page,
        referrer: referrer || null,
        userAgent: userAgent || null,
        country: data.country || null,
        region: data.region || null,
        city: data.city || null,
        deviceType: data.deviceType || null,
        sessionId,
        projectId: project.id
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking analytics:', error);
    return NextResponse.json({ error: 'Failed to track analytics' }, { status: 500 });
  }
}