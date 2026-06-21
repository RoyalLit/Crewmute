/**
 * API response envelope helpers.
 *
 * All API responses must use these helpers to produce the exact envelope
 * structure defined in . Controllers use these to
 * format responses; they must never construct response objects inline.
 */

export interface SuccessResponse<T> {
  success: true;
  data: T;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  meta: PaginationMeta;
}

/**
 * Wraps data in a standard success envelope.
 * Use for all non-paginated success responses.
 */
export function successResponse<T>(data: T): SuccessResponse<T> {
  return { success: true, data };
}

/**
 * Wraps a list and pagination metadata in a standard paginated envelope.
 * Use for all list endpoints (all list endpoints must be paginated — §11.4).
 */
export function paginatedResponse<T>(data: T[], meta: PaginationMeta): PaginatedResponse<T> {
  return { success: true, data, meta };
}

/**
 * Calculates totalPages from total items and page size.
 * Convenience helper to avoid repeated Math.ceil calls in controllers.
 */
export function buildPaginationMeta(
  total: number,
  page: number,
  pageSize: number
): PaginationMeta {
  return {
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  };
}
