// src/app/api/debug/check-admin/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const adminUser = await prisma.user.findUnique({
      where: { username: process.env.ADMIN_USERNAME || '' }
    });
    
    return NextResponse.json({ 
      exists: !!adminUser,
      isSuperUser: adminUser?.isSuperUser || false,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      return NextResponse.json({ 
        error: error.message 
      }, { status: 500 });
    } else {
      console.error("An unknown error occurred:", error);
      return NextResponse.json({ 
        error: "An unknown error occurred" 
      }, { status: 500 });
    }
  }
}