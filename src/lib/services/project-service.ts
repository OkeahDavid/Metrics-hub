import prisma from '@/lib/db';
import crypto from 'crypto';

/**
 * Project service for encapsulating database operations related to projects
 */
export class ProjectService {
  /**
   * Create a new project
   */
  static async createProject(name: string, userId: string) {
    // Generate a random API key
    const apiKey = crypto.randomBytes(16).toString('hex');

    return prisma.project.create({
      data: {
        name,
        apiKey,
        userId,
      },
    });
  }

  /**
   * Get projects for a user, or all projects if user is a superuser
   */
  static async getProjects(userId: string, isSuperUser: boolean) {
    return prisma.project.findMany({
      where: isSuperUser ? {} : { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get a project by ID
   */
  static async getProjectById(id: string, userId: string, isSuperUser: boolean) {
    return prisma.project.findFirst({
      where: {
        id,
        // Only allow access if superuser or owner
        ...(isSuperUser ? {} : { userId })
      }
    });
  }

  /**
   * Update a project
   */
  static async updateProject(id: string, userId: string, isSuperUser: boolean, data: { name?: string }) {
    // First check if user has access to this project
    const project = await this.getProjectById(id, userId, isSuperUser);
    
    if (!project) {
      throw new Error('Project not found or you do not have access');
    }
    
    return prisma.project.update({
      where: { id },
      data
    });
  }

  /**
   * Delete a project
   */
  static async deleteProject(id: string, userId: string, isSuperUser: boolean) {
    // First check if user has access to this project
    const project = await this.getProjectById(id, userId, isSuperUser);
    
    if (!project) {
      throw new Error('Project not found or you do not have access');
    }
    
    // Delete all related page views first
    await prisma.pageView.deleteMany({
      where: { projectId: id }
    });
    
    return prisma.project.delete({
      where: { id }
    });
  }

  /**
   * Generate a new API key for a project
   */
  static async regenerateApiKey(id: string, userId: string, isSuperUser: boolean) {
    // First check if user has access to this project
    const project = await this.getProjectById(id, userId, isSuperUser);
    
    if (!project) {
      throw new Error('Project not found or you do not have access');
    }
    
    // Generate a new API key
    const apiKey = crypto.randomBytes(16).toString('hex');
    
    return prisma.project.update({
      where: { id },
      data: { apiKey }
    });
  }

  /**
   * Validate a project API key
   */
  static async validateApiKey(apiKey: string) {
    return prisma.project.findUnique({
      where: { apiKey }
    });
  }
}