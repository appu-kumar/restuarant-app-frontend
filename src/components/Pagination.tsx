type Props = {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  totalLoaded: number;
  onLoadMore: () => void;
};

export function Pagination({
  hasNextPage,
  isFetchingNextPage,
  totalLoaded,
  onLoadMore,
}: Props) {
  return (
    <div className="mt-4 flex items-center justify-between">
      <p className="text-sm text-gray-500">
        {totalLoaded} orders loaded
        {hasNextPage && " — more available"}
      </p>
      <button
        onClick={onLoadMore}
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
  );
}