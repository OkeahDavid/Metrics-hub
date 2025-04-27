import { NextResponse } from 'next/server';

/**
 * Standard API error response structure
 */
export interface ApiErrorResponse {
  error: string;
  details?: unknown;
  code?: string;
}

/**
 * Handles errors in API routes with proper typing and standardized responses
 * @param error The error that occurred
 * @param defaultMessage Default message if error is not an Error instance
 * @returns NextResponse with standardized error format
 */
export function handleApiError(error: unknown, defaultMessage = "An unexpected error occurred"): NextResponse {
  console.error("API Error:", error);
  
  // Default error response
  const errorResponse: ApiErrorResponse = {
    error: defaultMessage
  };
  
  // Status code defaults to 500
  let status = 500;
  
  if (error instanceof Error) {
    errorResponse.error = error.message;
    
    // Handle specific error types
    if (error.name === 'PrismaClientKnownRequestError') {
      // Handle Prisma errors
      errorResponse.code = 'DATABASE_ERROR';
      
      // Define PrismaError type
      interface PrismaError extends Error {
        code?: string;
        meta?: { target?: string[] };
      }
      
      // P2002 is a unique constraint violation
      if ((error as PrismaError).code === 'P2002') {
        status = 409; // Conflict
        errorResponse.error = 'A record with this data already exists';
        errorResponse.details = (error as PrismaError).meta?.target || 'Unknown field';
      }
    } else if (error.name === 'ValidationError') {
      // Handle validation errors
      status = 400;
      errorResponse.code = 'VALIDATION_ERROR';
    } else if (error.name === 'UnauthorizedError') {
      // Handle auth errors
      status = 401;
      errorResponse.code = 'UNAUTHORIZED';
    }
  }
  
  return NextResponse.json(errorResponse, { status });
}