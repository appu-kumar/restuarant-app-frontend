import { useInfiniteQuery } from "@tanstack/react-query";
import type { PageResult } from "../types/order";

async function fetchOrders({
  pageParam,
}: {
  pageParam: number | null;
}): Promise<PageResult> {
  const url = new URL("http://localhost:3000/orders");
  url.searchParams.set("limit", "10");
  if (pageParam) url.searchParams.set("cursor", String(pageParam));
  const res = await fetch(url.toString());
  return res.json();
}

export function useOrders() {
  return useInfiniteQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    initialPageParam: null,
  });
}