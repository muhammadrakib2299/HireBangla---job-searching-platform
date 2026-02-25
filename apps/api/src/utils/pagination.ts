export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginationResult {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function getPaginationOptions(
  page?: number,
  limit?: number,
): PaginationOptions {
  const p = Math.max(1, page || 1);
  const l = Math.min(50, Math.max(1, limit || 20));
  return { page: p, limit: l };
}

export function getPaginationResult(
  total: number,
  options: PaginationOptions,
): PaginationResult {
  const totalPages = Math.ceil(total / options.limit);
  return {
    page: options.page,
    limit: options.limit,
    total,
    totalPages,
    hasNextPage: options.page < totalPages,
    hasPrevPage: options.page > 1,
  };
}

export function getSkip(options: PaginationOptions): number {
  return (options.page - 1) * options.limit;
}
