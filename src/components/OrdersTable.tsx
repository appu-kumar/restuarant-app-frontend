import { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { useOrders } from "../hooks/useOrders";
import { StatusBadge } from "./StatusBadge";
import { Pagination } from "./Pagination";
import type { Order } from "../types/order";

const col = createColumnHelper<Order>();

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
    cell: (i) => <StatusBadge status={i.getValue()} />,
  }),
  col.accessor("order_date", {
    header: "Date",
    cell: (i) => (
      <span className="text-gray-500 text-xs">{formatDate(i.getValue())}</span>
    ),
  }),
];

export function OrdersTable() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useOrders();

  const allOrders = useMemo(
    () => data?.pages.flatMap((p) => p.items) ?? [],
    [data]
  );

  const table = useReactTable({
    data: allOrders,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (status === "pending") {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400 text-sm">Loading orders...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500 text-sm">
          Failed to load orders. Is the backend running on port 3000?
        </p>
      </div>
    );
  }

  return (
    <>
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
                <tr key={row.id} className="hover:bg-blue-50 transition-colors">
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

      <Pagination
        hasNextPage={!!hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        totalLoaded={allOrders.length}
        onLoadMore={fetchNextPage}
      />
    </>
  );
}