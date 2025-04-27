import { handleApiError } from '@/lib/error-handler';
import { createSuccessResponse } from '@/lib/api-response';
import { ProjectService } from '@/lib/services/project-service';
import { AnalyticsService } from '@/lib/services/analytics-service';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the user session for authorization
    const session = await getServerSession(authOptions);
    if (!session) {
      return handleApiError(new Error('Unauthorized'), 'Authentication required');
    }

    const { id } = params;
    
    // Use the ProjectService to verify user has access to this project
    const project = await ProjectService.getProjectById(id, session.user.id, session.user.isSuperUser);

    if (!project) {
      return handleApiError(new Error('Project not found or access denied'), 'Project not found');
    }

    // Use the AnalyticsService to fetch live visitor count
    const visitorCount = await AnalyticsService.getLiveVisitorsCount(id);
    
    // Use standardized success response with Cache-Control headers
    return createSuccessResponse(
      { count: visitorCount },
      'Live visitor count retrieved successfully',
      {
        'Cache-Control': 'no-store, max-age=0'
      }
    );
  } catch (error) {
    return handleApiError(error, 'Failed to fetch live visitors data');
  }
}