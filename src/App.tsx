import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import {
  useInfiniteQuery,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

const queryClient = new QueryClient();

type Order = {
  id: number;
  raw_order_id: string;
  customer: string;
  waiter: string;
  table_number: string | null;
  items: string | null;
  total: number | null;
  status: string;
  order_date: string | null;
};

type PageResult = {
  items: Order[];
  nextCursor: number | null;
  hasMore: boolean;
};

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

const col = createColumnHelper<Order>();

const columns = [
  col.accessor("raw_order_id", { header: "Order ID" }),
  col.accessor("customer", { header: "Customer" }),
  col.accessor("waiter", { header: "Waiter" }),
  col.accessor("table_number", {
    header: "Table",
    cell: (i) => i.getValue() ?? "—",
  }),
  col.accessor("items", {
    header: "Items",
    cell: (i) => {
      const val = i.getValue();
      if (!val) return "—";
      // Try to parse JSON arrays for display
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed.join(", ");
      } catch {}
      return val.replace(/\n/g, ", ");
    },
  }),
  col.accessor("total", {
    header: "Total",
    cell: (i) =>
      i.getValue() != null ? `$${i.getValue()!.toFixed(2)}` : "—",
  }),
  col.accessor("status", {
    header: "Status",
    cell: (i) => {
      const s = i.getValue();
      const color =
        s === "completed"
          ? "bg-green-100 text-green-800"
          : s === "cancelled"
          ? "bg-red-100 text-red-800"
          : "bg-yellow-100 text-yellow-800";
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${color}`}
        >
          {s}
        </span>
      );
    },
  }),
  col.accessor("order_date", {
    header: "Date",
    cell: (i) => {
      const v = i.getValue();
      if (!v) return "—";
      return new Date(v).toLocaleDateString();
    },
  }),
];

function OrdersTable() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    initialPageParam: null,
  });

  const allOrders = useMemo(
    () => data?.pages.flatMap((p) => p.items) ?? [],
    [data]
  );

  const table = useReactTable({
    data: allOrders,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (status === "pending")
    return <p className="p-6 text-gray-500">Loading orders...</p>;
  if (status === "error")
    return <p className="p-6 text-red-500">Failed to load orders.</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">🍽️ Restaurant Orders</h1>
      <p className="text-sm text-gray-500 mb-6">
        Showing {allOrders.length} orders
      </p>

      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    className="px-4 py-3 text-left font-semibold text-gray-600"
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, i) => (
              <tr
                key={row.id}
                className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-4 py-3 text-gray-700 max-w-xs truncate"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <button
          onClick={() => fetchNextPage()}
          disabled={!hasNextPage || isFetchingNextPage}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700
                     disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          {isFetchingNextPage
            ? "Loading..."
            : hasNextPage
            ? "Load More"
            : "All Loaded ✓"}
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <OrdersTable />
    </QueryClientProvider>
  );
}