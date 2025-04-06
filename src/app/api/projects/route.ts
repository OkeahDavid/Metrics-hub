import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import crypto from 'crypto';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

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

    // Create the project with user association
    const project = await prisma.project.create({
      data: {
        name,
        apiKey,
        userId: session.user.id, // Associate with current user
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
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // If superuser, return all projects, otherwise filter by user
    const projects = await prisma.project.findMany({
      where: session.user.isSuperUser 
        ? {} 
        : { userId: session.user.id },
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