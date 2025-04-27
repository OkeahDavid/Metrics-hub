import prisma from '@/lib/db';

/**
 * Analytics service for encapsulating database operations related to analytics
 */
export class AnalyticsService {
  /**
   * Get page views for a project within a date range
   */
  static async getPageViews(projectId: string, from: Date, to: Date) {
    const pageViews = await prisma.$queryRaw`
      SELECT 
        DATE(createdAt) as date,
        COUNT(*) as count
      FROM PageView
      WHERE projectId = ${projectId}
        AND createdAt >= ${from}
        AND createdAt <= ${to}
      GROUP BY DATE(createdAt)
      ORDER BY date ASC
    `;

    return pageViews;
  }

  /**
   * Get device type breakdown for a project within a date range
   */
  static async getDeviceTypes(projectId: string, from: Date, to: Date) {
    const deviceTypes = await prisma.$queryRaw`
      SELECT 
        deviceType,
        COUNT(*) as count
      FROM PageView
      WHERE projectId = ${projectId}
        AND createdAt >= ${from}
        AND createdAt <= ${to}
      GROUP BY deviceType
      ORDER BY count DESC
    `;

    return deviceTypes;
  }

  /**
   * Get top referrers for a project within a date range
   */
  static async getTopReferrers(projectId: string, from: Date, to: Date, limit = 5) {
    const referrers = await prisma.$queryRaw`
      SELECT 
        COALESCE(referrer, 'Direct') as referrer,
        COUNT(*) as count
      FROM PageView
      WHERE projectId = ${projectId}
        AND createdAt >= ${from}
        AND createdAt <= ${to}
      GROUP BY referrer
      ORDER BY count DESC
      LIMIT ${limit}
    `;

    return referrers;
  }

  /**
   * Get top pages for a project within a date range
   */
  static async getTopPages(projectId: string, from: Date, to: Date, limit = 10) {
    const pages = await prisma.$queryRaw`
      SELECT 
        page,
        COUNT(*) as count
      FROM PageView
      WHERE projectId = ${projectId}
        AND createdAt >= ${from}
        AND createdAt <= ${to}
      GROUP BY page
      ORDER BY count DESC
      LIMIT ${limit}
    `;

    return pages;
  }

  /**
   * Get top countries for a project within a date range
   */
  static async getTopCountries(projectId: string, from: Date, to: Date, limit = 5) {
    const countries = await prisma.$queryRaw`
      SELECT 
        COALESCE(country, 'Unknown') as country,
        COUNT(*) as count
      FROM PageView
      WHERE projectId = ${projectId}
        AND createdAt >= ${from}
        AND createdAt <= ${to}
      GROUP BY country
      ORDER BY count DESC
      LIMIT ${limit}
    `;

    return countries;
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