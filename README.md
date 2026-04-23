---

````markdown
# Frontend - Order Management UI

## Tech Stack

- **Framework**: TanStack Start (React)
- **Routing**: TanStack Router
- **Tables**: TanStack Table
- **Styling**: Tailwind CSS
- **HTTP**: TanStack Query + Fetch
- **Type Safety**: TypeScript

## Features

### Orders Table

- Sortable columns (order #, customer, date, amount)
- Filterable by status and date range
- Search by customer name/email
- Cursor-based pagination (Load More)
- Status badges with colors
- Responsive design

### Order Management

- View order details modal
- Edit orders inline
- Delete with confirmation
- Create new orders
- Add/remove line items dynamically

## Setup

```bash
# Installation
cd frontend
bun install

# Development
bun run dev        # http://localhost:5173

# Production
bun run build
bun run preview

# Testing
bun run test
bun run type-check
```
````
