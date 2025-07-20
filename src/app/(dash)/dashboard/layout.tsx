import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Settings } from "lucide-react";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="border-b bg-white">
        <div className="container mx-auto flex items-center justify-between px-4 py-2">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold">Welcome</span>
            </div>
            <Badge variant="secondary">Bella Hair Salon</Badge>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
              <span className="text-sm font-semibold text-purple-600">SM</span>
            </div>
          </div>
        </div>
      </header>
      {children}
    </>
  );
}
