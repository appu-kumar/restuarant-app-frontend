export type Order = {
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

export type PageResult = {
  items: Order[];
  nextCursor: number | null;
  hasMore: boolean;
};