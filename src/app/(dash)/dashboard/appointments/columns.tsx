import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/format";
import type { Booking } from "@/types/appointment";

export const bookingColumns: ColumnDef<Booking>[] = [
  { id: "customerName", accessorKey: "customerName", header: "Customer" },
  { id: "email", accessorKey: "customerEmail", header: "Email" },
  { id: "phone", accessorKey: "customerPhone", header: "Phone" },
  { id: "service", accessorKey: "serviceName", header: "Service" },
  {
    id: "date",
    accessorKey: "appointmentDate",
    header: "Date",
    cell: ({ row }) =>
      new Date(row.original.appointmentDate).toLocaleDateString(),
  },
  {
    id: "time",
    accessorKey: "startTime",
    header: "Time",
    cell: ({ row }) => `${row.original.startTime} - ${row.original.endTime}`,
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const statusColors: Record<string, string> = {
        pending: "bg-yellow-100 text-yellow-800",
        confirmed: "bg-blue-100 text-blue-800",
        cancelled: "bg-red-100 text-red-800",
        completed: "bg-green-100 text-green-800",
      };
      return (
        <Badge className={statusColors[status]}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    },
  },
  {
    id: "price",
    accessorKey: "servicePrice",
    header: () => <div className="text-right">Price</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {formatCurrency(row.original.servicePrice)}
      </div>
    ),
  },
];


