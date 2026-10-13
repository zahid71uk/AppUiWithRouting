export const DATASET_PAGE_SIZE = 12;

export function paginateDataset<T>(items: T[], requestedPage: number, pageSize = DATASET_PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(Math.max(1, Math.trunc(requestedPage) || 1), totalPages);
  const startIndex = (currentPage - 1) * pageSize;

  return {
    items: items.slice(startIndex, startIndex + pageSize),
    currentPage,
    totalPages,
    firstItem: items.length === 0 ? 0 : startIndex + 1,
    lastItem: Math.min(startIndex + pageSize, items.length),
  };
}