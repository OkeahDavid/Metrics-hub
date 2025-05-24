import prisma from '@/lib/db';
import { format } from 'date-fns';

/**
 * Analytics service for encapsulating database operations related to analytics
 */
export class AnalyticsService {
  /**
   * Get page views for a project within a date range
   */
  static async getPageViews(projectId: string, from: Date, to: Date) {
  const pageViewsAggregation = await prisma.$queryRaw`
    SELECT 
      date_trunc('day', "createdAt")::date as date,
      COUNT(*)::int as count
    FROM "PageView"
    WHERE 
      "projectId" = ${projectId}
      AND "createdAt" >= ${from}
      AND "createdAt" <= ${to}
    GROUP BY date_trunc('day', "createdAt")
    ORDER BY date ASC
  `;

  return (pageViewsAggregation as { date: Date, count: number }[]).map(item => ({
    date: format(item.date, 'yyyy-MM-dd'),
    count: Number(item.count),
  }));
}

  /**
   * Get device type breakdown for a project within a date range
   */
  static async getDeviceTypes(projectId: string, from: Date, to: Date) {
    // Count by deviceType
    const deviceTypes = await prisma.pageView.groupBy({
      by: ['deviceType'],
      where: {
        projectId: projectId,
        createdAt: {
          gte: from,
          lte: to,
        },
      },
      _count: {
        deviceType: true,
      },
    });

    // Format for the response
    return deviceTypes.map((item: { deviceType: unknown; _count: { deviceType: unknown; }; }) => ({
      deviceType: item.deviceType || 'Unknown',
      count: item._count.deviceType,
    }));
  }

  /**
   * Get top referrers for a project within a date range
   */
  static async getTopReferrers(projectId: string, from: Date, to: Date, limit = 5) {
    // Count by referrer
    const referrers = await prisma.pageView.groupBy({
      by: ['referrer'],
      where: {
        projectId: projectId,
        createdAt: {
          gte: from,
          lte: to,
        },
      },
      _count: {
        referrer: true,
      },
      orderBy: {
        _count: {
          referrer: 'desc',
        },
      },
      take: limit,
    });

    // Format for the response
    return referrers.map((item: { referrer: unknown; _count: { referrer: unknown; }; }) => ({
      referrer: item.referrer || 'Direct',
      count: item._count.referrer,
    }));
  }

  /**
   * Get top pages for a project within a date range
   */
  static async getTopPages(projectId: string, from: Date, to: Date, limit = 10) {
    // Count by page
    const pages = await prisma.pageView.groupBy({
      by: ['page'],
      where: {
        projectId: projectId,
        createdAt: {
          gte: from,
          lte: to,
        },
      },
      _count: {
        page: true,
      },
      orderBy: {
        _count: {
          page: 'desc',
        },
      },
      take: limit,
    });

    // Get total count for percentage calculation
    const totalCount = await prisma.pageView.count({
      where: {
        projectId: projectId,
        createdAt: {
          gte: from,
          lte: to,
        },
      },
    });

    // Format for the response
    return pages.map((item: { page: unknown; _count: { page: number; }; }) => ({
      path: item.page,
      count: item._count.page,
      percentage: totalCount > 0 ? (item._count.page / totalCount) * 100 : 0,
    }));
  }

  /**
   * Get top countries for a project within a date range
   */
  static async getTopCountries(projectId: string, from: Date, to: Date, limit = 5) {
    // Count by country
    const countries = await prisma.pageView.groupBy({
      by: ['country'],
      where: {
        projectId: projectId,
        createdAt: {
          gte: from,
          lte: to,
        },
      },
      _count: {
        country: true,
      },
      orderBy: {
        _count: {
          country: 'desc',
        },
      },
      take: limit,
    });

    // Format for the response
    return countries.map((item: { country: unknown; _count: { country: unknown; }; }) => ({
      country: item.country || 'Unknown',
      count: item._count.country,
    }));
  }

  /**
   * Get live visitors count (visitors in the last 5 minutes)
   */
  static async getLiveVisitorsCount(projectId: string) {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    // Count distinct session IDs in the last 5 minutes
    const result = await prisma.pageView.groupBy({
      by: ['sessionId'],
      where: {
        projectId: projectId,
        createdAt: {
          gte: fiveMinutesAgo
        }
      },
      _count: {
        sessionId: true
      }
    });

    return result.length;
  }
}