import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { handleApiError } from "@/lib/error-handler";
import { createSuccessResponse } from "@/lib/api-response";

interface UserResponse {
  id: string;
  username: string;
  isSuperUser: boolean;
}

export async function POST(
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

    // Only superusers can toggle other users' status
    if (!session.user.isSuperUser) {
      return handleApiError(
        new Error("Insufficient permissions"),
        "Only administrators can modify user permissions",
      );
    }
    
    const userId = params.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return handleApiError(
        new Error("User not found"),
        "The specified user could not be found",
      );
    }

    // Toggle superuser status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isSuperUser: !user.isSuperUser },
    });

    const response: UserResponse = {
      id: updatedUser.id,
      username: updatedUser.username,
      isSuperUser: updatedUser.isSuperUser,
    };

    return createSuccessResponse(
      response,
      updatedUser.isSuperUser 
        ? "User was granted administrator privileges" 
        : "Administrator privileges were revoked"
    );
  } catch (error) {
    return handleApiError(error, "Failed to update user permissions");
  }
}