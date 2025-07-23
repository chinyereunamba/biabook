"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { ServicePerformance } from "@/types/analytics";

interface ServicePerformanceTableProps {
  services: ServicePerformance[];
}

export function ServicePerformanceTable({
  services,
}: ServicePerformanceTableProps) {
  // Format currency for display
  const formatCurrency = (value: number) => {
    return `$${(value / 100).toFixed(2)}`;
  };

  // Get cancellation rate color
  const getCancellationRateColor = (rate: number) => {
    if (rate < 5) return "bg-green-100 text-green-800";
    if (rate < 10) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Service</TableHead>
            <TableHead className="text-right">Bookings</TableHead>
            <TableHead className="text-right">Revenue</TableHead>
            <TableHead className="text-right">Avg. Price</TableHead>
            <TableHead className="text-right">Cancellation Rate</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="py-6 text-center">
                No service data available for the selected period
              </TableCell>
            </TableRow>
          ) : (
            services.map((service) => (
              <TableRow key={service.serviceId}>
                <TableCell className="font-medium">
                  {service.serviceName}
                </TableCell>
                <TableCell className="text-right">
                  {service.bookingCount}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(service.revenue)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(service.averagePrice)}
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant="outline"
                    className={getCancellationRateColor(
                      service.cancellationRate,
                    )}
                  >
                    {service.cancellationRate.toFixed(1)}%
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
