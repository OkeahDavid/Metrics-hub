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

    // Only superusers can delete any project
    if (!session.user.isSuperUser) {
      return handleApiError(
        new Error("Insufficient permissions"),
        "Only administrators can delete projects"
      );
    }

    const projectId = params.id;

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        _count: {
          select: { pageViews: true }
        }
      }
    });

    if (!project) {
      return handleApiError(
        new Error("Project not found"),
        "The specified project could not be found"
      );
    }

    // Delete project (this will cascade delete page views)
    await prisma.project.delete({
      where: { id: projectId }
    });

    return createSuccessResponse(
      { deletedProject: project.name, deletedPageViews: project._count.pageViews },
      `Project "${project.name}" and ${project._count.pageViews} page view(s) deleted successfully`
    );
  } catch (error) {
    return handleApiError(error as Error, "Failed to delete project");
  }
}
