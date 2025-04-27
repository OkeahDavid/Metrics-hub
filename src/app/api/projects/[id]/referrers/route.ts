import { NextRequest } from 'next/server';
import { AnalyticsService } from '@/lib/services/analytics-service';
import { ProjectService } from '@/lib/services/project-service';
import { handleApiError } from '@/lib/error-handler';
import { createSuccessResponse } from '@/lib/api-response';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { parseISO } from 'date-fns';

interface ReferrerData {
  referrer: string;
  count: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the user session for authorization
    const session = await getServerSession(authOptions);
    if (!session) {
      return handleApiError(new Error('Unauthorized'), 'Authentication required');
    }

    const { id } = params;
    
    // Parse date range from query params
    const searchParams = request.nextUrl.searchParams;
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');
    const limitParam = searchParams.get('limit');
    
    let fromDate: Date, toDate: Date;
    const limit = limitParam ? parseInt(limitParam, 10) : 5;
    
    if (fromParam && toParam) {
      // Use provided date range
      fromDate = parseISO(fromParam);
      toDate = parseISO(toParam);
    } else {
      // Default to last 7 days if no dates provided
      toDate = new Date();
      fromDate = new Date(toDate);
      fromDate.setDate(fromDate.getDate() - 7);
    }
    
    // Validate dates
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return handleApiError(
        new Error('Invalid date format'), 
        'Please provide dates in ISO format (YYYY-MM-DD)'
      );
    }

    // Use the ProjectService to verify user has access to this project
    const project = await ProjectService.getProjectById(
      id,
      session.user.id,
      session.user.isSuperUser
    );

    if (!project) {
      return handleApiError(new Error('Project not found or access denied'), 'Project not found');
    }

    // Use the AnalyticsService to fetch referrer data
    const referrersData = await AnalyticsService.getTopReferrers(id, fromDate, toDate, limit) as ReferrerData[];

    return createSuccessResponse(
      referrersData,
      'Referrer data retrieved successfully',
      {
        'Cache-Control': 'public, max-age=60' // Cache for 1 minute
      }
    );
  } catch (error) {
    return handleApiError(error, 'Failed to fetch referrer data');
  }
}