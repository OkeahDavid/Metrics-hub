import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name } = data;

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      );
    }

    // Generate a random API key
    const apiKey = crypto.randomBytes(16).toString('hex');

    // Create the project without user association
    const project = await prisma.project.create({
      data: {
        name,
        apiKey,
      },
    });

    return NextResponse.json({ id: project.id, name: project.name, apiKey: project.apiKey });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}