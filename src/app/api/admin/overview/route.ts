import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { handleApiError } from "@/lib/error-handler";
import { createSuccessResponse } from "@/lib/api-response";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return handleApiError(
        new Error("Unauthorized"),
        "Authentication required"
      );
    }

    // Only superusers can access admin panel
    if (!session.user.isSuperUser) {
      return handleApiError(
        new Error("Insufficient permissions"),
        "Admin access required"
      );
    }

    // Get all users with their project counts
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        isSuperUser: true,
        createdAt: true,
        _count: {
          select: {
            projects: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get all projects with user information
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        apiKey: true,
        createdAt: true,
        userId: true,
        user: {
          select: {
            id: true,
            username: true,
            isSuperUser: true
          }
        },
        _count: {
          select: {
            pageViews: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get overall statistics
    const totalPageViews = await prisma.pageView.count();
    
    return createSuccessResponse({
      users,
      projects,
      stats: {
        totalUsers: users.length,
        totalProjects: projects.length,
        totalPageViews
      }
    });

  } catch (error) {
    return handleApiError(error as Error);
  }
}
