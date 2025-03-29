import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // For security, in a real app you'd want more checks here
    // This is simplified for the demo - normally only admins could do this
    
    const userId = params.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Only allow users to toggle their own superuser status
    if (session.user.id !== userId) {
      return NextResponse.json(
        { error: "You can only modify your own account" },
        { status: 403 }
      );
    }

    // Toggle superuser status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isSuperUser: !user.isSuperUser },
    });

    return NextResponse.json({
      id: updatedUser.id,
      isSuperUser: updatedUser.isSuperUser,
    });
  } catch (error) {
    console.error("Error toggling superuser status:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}