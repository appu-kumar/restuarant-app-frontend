import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { OrdersTable } from "./components/OrdersTable";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                🍽️ Restaurant Orders
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Staff operator view
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
              <span className="text-xs text-gray-500">API Connected</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <OrdersTable />
        </div>
      </div>
    </QueryClientProvider>
  );
}