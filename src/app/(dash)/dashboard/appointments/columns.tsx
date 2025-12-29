import type { Booking } from "@/types/appointment";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency } from "@/utils/format";

export const bookingColumns: ColumnDef<Booking>[] = [
  // {
  //   id: "select",
  //   header: ({ table }) => (
  //     <Checkbox
  //       checked={
  //         table.getIsAllPageRowsSelected() ||
  //         (table.getIsSomePageRowsSelected() && "indeterminate")
  //       }
  //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //       aria-label="Select all"
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       aria-label="Select row"
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  {
    accessorKey: "customerName",
    header: "Customer",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "customerPhone",
    header: "Phone",
  },
  {
    accessorKey: "serviceName",
    header: "Service",
  },
  {
    accessorKey: "appointmentDate",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.original.appointmentDate);
      return date.toLocaleDateString();
    },
  },
  {
    accessorKey: "startTime",
    header: "Time",
    cell: ({ row }) => {
      return `${row.original.startTime} - ${row.original.endTime}`;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const statusColors = {
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
    accessorKey: "servicePrice",
    header: () => <div className="text-right">Price</div>,
    cell: ({ row }) => {
      const amount = formatCurrency(
        parseFloat(row.original.servicePrice.toString()),
      );
      return <div className="text-right font-medium">{amount}</div>;
    },
  },
];

// id: appointments.id,
// customerName: appointments.customerName,
// customerEmail: appointments.customerEmail,
// customerPhone: appointments.customerPhone,
// appointmentDate: appointments.appointmentDate,
// startTime: appointments.startTime,
// endTime: appointments.endTime,
// status: appointments.status,
// notes: appointments.notes,
// confirmationNumber: appointments.confirmationNumber,
// createdAt: appointments.createdAt,
// serviceName: services.name,
// servicePrice: services.price,
// serviceDuration: services.duration,
