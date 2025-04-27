import { NextResponse } from 'next/server';

/**
 * Standard API success response structure
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Creates a standardized success response
 * @param data The data to return in the response
 * @param message Optional success message
 * @returns NextResponse with standardized success format
 */
export function createSuccessResponse<T>(
  data: T, 
  message?: string,
  headers?: HeadersInit
): NextResponse {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
    ...(message && { message })
  };
  
  return NextResponse.json(response, { status: 200, headers });
}

/**
 * Creates a standardized created response (201)
 * @param data The data to return in the response
 * @param message Optional success message
 * @returns NextResponse with standardized success format
 */
export function createCreatedResponse<T>(
  data: T, 
  message = 'Resource created successfully',
  headers?: HeadersInit
): NextResponse {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
    message
  };
  
  return NextResponse.json(response, { status: 201, headers });
}

/**
 * Creates a standardized no content response (204)
 * @returns NextResponse with 204 status
 */
export function createNoContentResponse(
  headers?: HeadersInit
): NextResponse {
  return new NextResponse(null, { 
    status: 204,
    headers
  });
}