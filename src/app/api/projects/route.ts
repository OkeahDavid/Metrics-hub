import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { handleApiError } from "@/lib/error-handler";
import { createSuccessResponse, createCreatedResponse } from "@/lib/api-response";
import { ProjectService } from "@/lib/services/project-service";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return handleApiError(new Error('Unauthorized'), 'Authentication required');
    }

    const data = await request.json();
    const { name } = data;

    if (!name || typeof name !== 'string') {
      return handleApiError(new Error('Project name is required'), 'Validation failed');
    }

    // Using the project service to create a project
    const project = await ProjectService.createProject(name, session.user.id);

    return createCreatedResponse({
      id: project.id, 
      name: project.name, 
      apiKey: project.apiKey
    });
  } catch (error) {
    return handleApiError(error, 'Failed to create project');
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return handleApiError(new Error('Unauthorized'), 'Authentication required');
    }

    // Using the project service to get projects
    const projects = await ProjectService.getProjects(
      session.user.id, 
      session.user.isSuperUser
    );
    
    return createSuccessResponse(projects);
  } catch (error) {
    return handleApiError(error, 'Failed to fetch projects');
  }
}