// app/api/users/[id]/toggle-superuser/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

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

    // Only superusers can toggle other users' status
    if (!session.user.isSuperUser) {
      return NextResponse.json(
        { error: "Only administrators can modify user permissions" },
        { status: 403 }
      );
    }
    
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