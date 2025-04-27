import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { handleApiError } from "@/lib/error-handler";
import { createSuccessResponse, createNoContentResponse } from "@/lib/api-response";
import { ProjectService } from "@/lib/services/project-service";

interface ProjectDetailContext {
  params: { 
    id: string 
  }
}

export async function GET(
  request: Request,
  context: ProjectDetailContext
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return handleApiError(new Error('Unauthorized'), 'Authentication required');
    }

    const { id } = context.params;
    
    // Use ProjectService to verify user has access to this project
    const project = await ProjectService.getProjectById(
      id, 
      session.user.id, 
      session.user.isSuperUser
    );
    
    if (!project) {
      return handleApiError(
        new Error('Project not found or access denied'), 
        'Project not found', 
      );
    }
    
    return createSuccessResponse(project, 'Project details retrieved successfully');
  } catch (error) {
    return handleApiError(error, 'Failed to fetch project details');
  }
}

export async function DELETE(
  request: Request,
  context: ProjectDetailContext
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return handleApiError(new Error('Unauthorized'), 'Authentication required');
    }

    const { id } = context.params;
    
    // Use ProjectService to delete project
    try {
      await ProjectService.deleteProject(id, session.user.id, session.user.isSuperUser);
      
      // Use standardized no-content response for successful deletion
      return createNoContentResponse();
    } catch (error) {
      if ((error as Error).message === 'Project not found or you do not have access') {
        return handleApiError(error, 'Project not found or you do not have permission to delete it');
      }
      throw error; // Re-throw for the outer catch block to handle
    }
  } catch (error) {
    return handleApiError(error, 'Failed to delete project');
  }
}

export async function PATCH(
  request: Request,
  context: ProjectDetailContext
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return handleApiError(new Error('Unauthorized'), 'Authentication required');
    }

    const { id } = context.params;
    const data = await request.json();
    
    // Validate the request data
    if (!data || (data.name !== undefined && typeof data.name !== 'string')) {
      return handleApiError(
        new Error('Invalid update data'), 
        'Project name must be a string',
      );
    }

    // Use ProjectService to update project
    try {
      const updatedProject = await ProjectService.updateProject(
        id, 
        session.user.id, 
        session.user.isSuperUser, 
        { name: data.name }
      );
      
      return createSuccessResponse(
        updatedProject, 
        'Project updated successfully'
      );
    } catch (error) {
      if ((error as Error).message === 'Project not found or you do not have access') {
        return handleApiError(
          error, 
          'Project not found or you do not have permission to update it',
        );
      }
      throw error; // Re-throw for the outer catch block to handle
    }
  } catch (error) {
    return handleApiError(error, 'Failed to update project');
  }
}