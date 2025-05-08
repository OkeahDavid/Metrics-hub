import { NextRequest } from 'next/server';
import { AnalyticsService } from '@/lib/services/analytics-service';
import { ProjectService } from '@/lib/services/project-service';
import { handleApiError } from '@/lib/error-handler';
import { createSuccessResponse } from '@/lib/api-response';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { parseISO, subDays } from 'date-fns';

interface PageViewsResponse {
  date: string;
  count: number;
}

type Props = {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, props: Props) {
  try {
    // Get the user session for authorization
    const session = await getServerSession(authOptions);
    if (!session) {
      return handleApiError(new Error('Unauthorized'), 'Authentication required');
    }

    const { id } = props.params;

    // Get and parse date range from query params
    const searchParams = request.nextUrl.searchParams;
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');
    const daysParam = searchParams.get('days');
    const allTimeParam = searchParams.get('all');
    
    let fromDate: Date, toDate: Date;
    
    if (allTimeParam === 'true') {
      // All time - set fromDate to epoch beginning and toDate to current
      toDate = new Date();
      fromDate = new Date(0); // January 1, 1970
    } else if (fromParam && toParam) {
      // Use provided date range
      fromDate = parseISO(fromParam);
      toDate = parseISO(toParam);
    } else if (daysParam) {
      // Handle legacy days parameter
      const days = parseInt(daysParam, 10) || 7;
      toDate = new Date();
      fromDate = subDays(toDate, days - 1); // Subtracting (days-1) to include the current day
    } else {
      // Default to last 7 days if no parameters provided
      toDate = new Date();
      fromDate = subDays(toDate, 6); // 7 days including today
    }
    
    // Validate dates
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return handleApiError(
        new Error('Invalid date format'), 
        'Please provide valid date parameters'
      );
    }

    // Use ProjectService to verify user has access to this project
    const project = await ProjectService.getProjectById(
      id, 
      session.user.id, 
      session.user.isSuperUser
    );

    if (!project) {
      return handleApiError(new Error('Project not found or access denied'), 'Project not found');
    }

    // Use AnalyticsService to fetch page views data
    const pageViews = await AnalyticsService.getPageViews(id, fromDate, toDate) as PageViewsResponse[];

    return createSuccessResponse(
      pageViews, 
      'Analytics data retrieved successfully',
      {
        'Cache-Control': 'public, max-age=60' // Cache for 1 minute
      }
    );
  } catch (error) {
    return handleApiError(error, 'Failed to fetch analytics data');
  }
}