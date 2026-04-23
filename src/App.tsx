import { useMemo } from "react";
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

function formatItems(val: string | null): string {
  if (!val) return "—";
  try {
    const parsed = JSON.parse(val);
    if (Array.isArray(parsed)) return parsed.join(", ");
  } catch {}
  return val.replace(/\n/g, ", ");
}

function formatDate(val: string | null): string {
  if (!val) return "—";
  return new Date(val).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const col = createColumnHelper<Order>();

const columns = [
  col.accessor("raw_order_id", {
    header: "Order ID",
    cell: (i) => (
      <span className="font-mono text-xs text-blue-700 font-semibold">
        {i.getValue()}
      </span>
    ),
  }),
  col.accessor("customer", {
    header: "Customer",
    cell: (i) => (
      <span className="font-medium text-gray-900">{i.getValue()}</span>
    ),
  }),
  col.accessor("waiter", { header: "Waiter" }),
  col.accessor("table_number", {
    header: "Table",
    cell: (i) => (
      <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-700 text-xs font-mono">
        {i.getValue() ?? "—"}
      </span>
    ),
  }),
  col.accessor("items", {
    header: "Items",
    cell: (i) => (
      <span className="text-gray-600 text-xs">{formatItems(i.getValue())}</span>
    ),
  }),
  col.accessor("total", {
    header: "Total",
    cell: (i) =>
      i.getValue() != null ? (
        <span className="font-semibold text-green-700">
          ${i.getValue()!.toFixed(2)}
        </span>
      ) : (
        <span className="text-gray-400">—</span>
      ),
  }),
  col.accessor("status", {
    header: "Status",
    cell: (i) => {
      const s = i.getValue();
      const styles =
        s === "completed"
          ? "bg-green-100 text-green-800"
          : s === "cancelled"
          ? "bg-red-100 text-red-800"
          : "bg-yellow-100 text-yellow-800";
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles}`}>
          {s}
        </span>
      );
    },
  }),
  col.accessor("order_date", {
    header: "Date",
    cell: (i) => (
      <span className="text-gray-500 text-xs">{formatDate(i.getValue())}</span>
    ),
  }),
];

function OrdersTable() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">🍽️ Restaurant Orders</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Staff operator view — {allOrders.length} orders loaded
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
            <span className="text-xs text-gray-500">API Connected</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {status === "pending" ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-400 text-sm">Loading orders...</p>
          </div>
        ) : status === "error" ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-red-500 text-sm">
              Failed to load orders. Is the backend running?
            </p>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      {table.getHeaderGroups().map((hg) =>
                        hg.headers.map((h) => (
                          <th
                            key={h.id}
                            className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                          >
                            {flexRender(h.column.columnDef.header, h.getContext())}
                          </th>
                        ))
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        className="hover:bg-blue-50 transition-colors"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className="px-4 py-3 max-w-[200px] truncate"
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {allOrders.length} orders loaded
                {hasNextPage && " — more available"}
              </p>
              <button
                onClick={() => fetchNextPage()}
                disabled={!hasNextPage || isFetchingNextPage}
                className="px-5 py-2 bg-blue-600 text-white text-sm font-medium
                           rounded-lg hover:bg-blue-700 transition
                           disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isFetchingNextPage
                  ? "Loading..."
                  : hasNextPage
                  ? "Load More Orders"
                  : "✓ All Orders Loaded"}
              </button>
            </div>
          </>
        )}
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