import { NextRequest } from 'next/server';
import { AnalyticsService } from '@/lib/services/analytics-service';
import { ProjectService } from '@/lib/services/project-service';
import { handleApiError } from '@/lib/error-handler';
import { createSuccessResponse } from '@/lib/api-response';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { parseISO, subDays, startOfDay, endOfDay } from 'date-fns';

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
      toDate = new Date();
      fromDate = new Date(0); // January 1, 1970
    } else if (fromParam && toParam) {
      fromDate = startOfDay(parseISO(fromParam));
      toDate = endOfDay(parseISO(toParam));
    } else if (daysParam) {
      const days = parseInt(daysParam, 10) || 7;
      toDate = endOfDay(new Date());
      fromDate = startOfDay(subDays(toDate, days - 1));
    } else {
      toDate = endOfDay(new Date());
      fromDate = startOfDay(subDays(toDate, 6));
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

    // Fetch all analytics data in parallel
    const [
      pageViews,
      deviceTypes,
      referrers,
      topPages,
      countries
    ] = await Promise.all([
      AnalyticsService.getPageViews(id, fromDate, toDate),
      AnalyticsService.getDeviceTypes(id, fromDate, toDate),
      AnalyticsService.getTopReferrers(id, fromDate, toDate, 5),
      AnalyticsService.getTopPages(id, fromDate, toDate, 10),
      AnalyticsService.getTopCountries(id, fromDate, toDate, 5)
    ]);

    // Unified analytics object
    const analytics = {
      pageViews,
      deviceTypes,
      referrers,
      topPages,
      countries
    };

    return createSuccessResponse(
      analytics,
      'Analytics data retrieved successfully',
      {
        'Cache-Control': 'public, max-age=60' // Cache for 1 minute
      }
    );
  } catch (error) {
    return handleApiError(error, 'Failed to fetch analytics data');
  }
}