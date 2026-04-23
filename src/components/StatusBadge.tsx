type Props = { status: string };

export function StatusBadge({ status }: Props) {
  const styles =
    status === "completed"
      ? "bg-green-100 text-green-800"
      : status === "cancelled"
      ? "bg-red-100 text-red-800"
      : "bg-yellow-100 text-yellow-800";

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles}`}>
      {status}
    </span>
  );
}