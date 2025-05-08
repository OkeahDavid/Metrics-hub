import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AnalyticsService } from '@/lib/services/analytics-service';
import { handleApiError } from '@/lib/error-handler';
import Papa from 'papaparse';

// Define types for the export data
interface ExportDataItem {
  type: string;
  date: string;
  count: number;
  deviceType: string;
  referrer: string;
  path: string;
  country: string;
  percentage: string;
}

// Define types for analytics data
interface PageView {
  date: string;
  count: number;
}

interface DeviceType {
  deviceType: string;
  count: number;
}

interface Referrer {
  referrer: string;
  count: number;
}

interface TopPage {
  path: string;
  count: number;
  percentage: number;
}

interface Country {
  country: string;
  count: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = params.id;
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'json';
    
    // Default to last 30 days if no dates provided
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    // Gather all analytics data
    const [pageViews, deviceTypes, referrers, topPages, countries] = await Promise.all([
      AnalyticsService.getPageViews(projectId, startDate, endDate) as Promise<PageView[]>,
      AnalyticsService.getDeviceTypes(projectId, startDate, endDate) as Promise<DeviceType[]>,
      AnalyticsService.getTopReferrers(projectId, startDate, endDate, 10) as Promise<Referrer[]>,
      AnalyticsService.getTopPages(projectId, startDate, endDate, 20) as Promise<TopPage[]>,
      AnalyticsService.getTopCountries(projectId, startDate, endDate, 10) as Promise<Country[]>
    ]);

    const analyticsData = {
      projectId,
      exportDate: new Date().toISOString(),
      dateRange: {
        from: startDate.toISOString(),
        to: endDate.toISOString()
      },
      pageViews,
      deviceTypes,
      referrers,
      topPages,
      countries
    };

    if (format === 'csv') {
      // Flatten the data for CSV
      const flatData: ExportDataItem[] = [];
      
      // Add page views data
      pageViews.forEach(item => {
        flatData.push({
          type: 'pageView',
          date: item.date,
          count: item.count,
          deviceType: '',
          referrer: '',
          path: '',
          country: '',
          percentage: ''
        });
      });
      
      // Add device types data
      deviceTypes.forEach(item => {
        flatData.push({
          type: 'deviceType',
          date: '',
          count: item.count,
          deviceType: item.deviceType,
          referrer: '',
          path: '',
          country: '',
          percentage: ''
        });
      });
      
      // Add referrers data
      referrers.forEach(item => {
        flatData.push({
          type: 'referrer',
          date: '',
          count: item.count,
          deviceType: '',
          referrer: item.referrer,
          path: '',
          country: '',
          percentage: ''
        });
      });
      
      // Add top pages data
      topPages.forEach(item => {
        flatData.push({
          type: 'page',
          date: '',
          count: item.count,
          deviceType: '',
          referrer: '',
          path: item.path,
          country: '',
          percentage: item.percentage.toFixed(2)
        });
      });
      
      // Add countries data
      countries.forEach(item => {
        flatData.push({
          type: 'country',
          date: '',
          count: item.count,
          deviceType: '',
          referrer: '',
          path: '',
          country: item.country,
          percentage: ''
        });
      });
      
      // Convert to CSV
      const csv = Papa.unparse(flatData);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
        }
      });
    } else {
      // Return as JSON
      return new NextResponse(JSON.stringify(analyticsData), {
        headers: {
          'Content-Type': 'application/json',
        }
      });
    }
  } catch (error) {
    return handleApiError(error);
  }
}