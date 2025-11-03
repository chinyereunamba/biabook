"use client";

import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Shield, User } from "lucide-react";

export function UserRoleDisplay() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="h-6 w-16 animate-pulse rounded bg-gray-200"></div>;
  }

  if (!session?.user) {
    return null;
  }

  const isAdmin = session.user.role === "admin";

  return (
    <Badge
      variant={isAdmin ? "destructive" : "secondary"}
      className="flex items-center gap-1"
    >
      {isAdmin ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
      {session.user.role?.toUpperCase() || "USER"}
    </Badge>
  );
}
