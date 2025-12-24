import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { handleApiError } from "@/lib/error-handler";
import { createSuccessResponse } from "@/lib/api-response";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return handleApiError(
        new Error("Unauthorized"),
        "Authentication required"
      );
    }

    // Only superusers can delete users
    if (!session.user.isSuperUser) {
      return handleApiError(
        new Error("Insufficient permissions"),
        "Only administrators can delete users"
      );
    }

    const userId = params.id;
    
    // Prevent deleting yourself
    if (userId === session.user.id) {
      return handleApiError(
        new Error("Cannot delete own account"),
        "You cannot delete your own account"
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: { projects: true }
        }
      }
    });

    if (!user) {
      return handleApiError(
        new Error("User not found"),
        "The specified user could not be found"
      );
    }

    // Delete user (this will cascade delete their projects and page views)
    await prisma.user.delete({
      where: { id: userId }
    });

    return createSuccessResponse(
      { deletedUser: user.username, deletedProjects: user._count.projects },
      `User ${user.username} and ${user._count.projects} project(s) deleted successfully`
    );
  } catch (error) {
    return handleApiError(error as Error, "Failed to delete user");
  }
}
