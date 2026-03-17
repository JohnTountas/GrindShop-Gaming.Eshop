/**
 * Shared API error envelope used by frontend error handling.
 */
export interface ApiError {
  error: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}
