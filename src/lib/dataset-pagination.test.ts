import { describe, expect, it } from "vitest";

import { paginateDataset } from "@/lib/dataset-pagination";

describe("paginateDataset", () => {
  const rows = Array.from({ length: 25 }, (_, index) => index + 1);

  it("returns the requested page with item range and total pages", () => {
    expect(paginateDataset(rows, 2)).toEqual({
      items: Array.from({ length: 12 }, (_, index) => index + 13),
      currentPage: 2,
      totalPages: 3,
      firstItem: 13,
      lastItem: 24,
    });
  });

  it("clamps invalid and out-of-range pages", () => {
    expect(paginateDataset(rows, 0).currentPage).toBe(1);
    expect(paginateDataset(rows, 99).currentPage).toBe(3);
  });

  it("reports an empty range for an empty dataset", () => {
    expect(paginateDataset([], 1)).toEqual({
      items: [],
      currentPage: 1,
      totalPages: 1,
      firstItem: 0,
      lastItem: 0,
    });
  });
});