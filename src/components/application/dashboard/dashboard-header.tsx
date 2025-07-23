"use client";

import { Button } from "@/components/ui/button";
import { Calendar, Download } from "lucide-react";

interface DashboardHeaderProps {
  heading: string;
  subheading?: string;
  showExport?: boolean;
  onExport?: () => void;
}

export function DashboardHeader({
  heading,
  subheading,
  showExport = false,
  onExport,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{heading}</h1>
        {subheading && <p className="text-muted-foreground">{subheading}</p>}
      </div>
      {showExport && (
        <div className="mt-2 flex items-center gap-2 sm:mt-0">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1"
            onClick={onExport}
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export</span>
          </Button>
        </div>
      )}
    </div>
  );
}
