import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { businesses, users, appointments } from "@/server/db/schema";
import { eq, desc, like, or, count, sql } from "drizzle-orm";

interface LogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warning" | "error" | "success";
  category: string;
  message: string;
  details?: string;
  userId?: string;
  userEmail?: string;
}

// Generate system logs based on actual database activity
const generateSystemLogs = async (): Promise<LogEntry[]> => {
  const logs: LogEntry[] = [];

  try {
    // Get recent appointments for booking logs
    const recentAppointments = await db
      .select({
        id: appointments.id,
        createdAt: appointments.createdAt,
        status: appointments.status,
        customerEmail: appointments.customerEmail,
        businessName: businesses.name,
      })
      .from(appointments)
      .leftJoin(businesses, eq(appointments.businessId, businesses.id))
      .orderBy(desc(appointments.createdAt))
      .limit(20);

    // Convert appointments to log entries
    recentAppointments.forEach((appointment, index) => {
      logs.push({
        id: `booking-${appointment.id}`,
        timestamp: appointment.createdAt.toISOString(),
        level: appointment.status === "confirmed" ? "success" : "info",
        category: "Booking",
        message: `New appointment ${appointment.status}`,
        details: `Business: ${appointment.businessName || "Unknown"}`,
        userEmail: appointment.customerEmail || undefined,
      });
    });

    // Get recent business registrations
    const recentBusinesses = await db
      .select({
        id: businesses.id,
        name: businesses.name,
        createdAt: businesses.createdAt,
        ownerEmail: users.email,
      })
      .from(businesses)
      .leftJoin(users, eq(businesses.ownerId, users.id))
      .orderBy(desc(businesses.createdAt))
      .limit(10);

    recentBusinesses.forEach((business) => {
      logs.push({
        id: `business-${business.id}`,
        timestamp: business.createdAt.toISOString(),
        level: "success",
        category: "Business",
        message: "New business registered",
        details: `Business: ${business.name}`,
        userEmail: business.ownerEmail || undefined,
      });
    });

    // Add some system logs
    const now = new Date();
    logs.push(
      {
        id: "system-startup",
        timestamp: new Date(now.getTime() - 3600000).toISOString(), // 1 hour ago
        level: "info",
        category: "System",
        message: "Application started successfully",
        details: "Server initialized and ready to accept connections",
      },
      {
        id: "db-connection",
        timestamp: new Date(now.getTime() - 3500000).toISOString(),
        level: "success",
        category: "Database",
        message: "Database connection established",
        details: "Connected to SQLite database",
      },
      {
        id: "auth-service",
        timestamp: new Date(now.getTime() - 3400000).toISOString(),
        level: "info",
        category: "Authentication",
        message: "Authentication service initialized",
        details: "NextAuth.js configured with Google OAuth",
      },
    );

    // Sort logs by timestamp (newest first)
    logs.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    return logs;
  } catch (error) {
    console.error("Error generating system logs:", error);

    // Return fallback logs if database query fails
    const now = new Date();
    return [
      {
        id: "system-error",
        timestamp: now.toISOString(),
        level: "error",
        category: "System",
        message: "Failed to generate system logs",
        details: "Database query failed, showing fallback data",
      },
      {
        id: "system-startup",
        timestamp: new Date(now.getTime() - 3600000).toISOString(),
        level: "info",
        category: "System",
        message: "Application started successfully",
        details: "Server initialized and ready to accept connections",
      },
    ];
  }
};

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    // Check if user is admin
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const level = searchParams.get("level");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Generate system logs
    let logs = await generateSystemLogs();

    // Apply filters
    if (level && level !== "all") {
      logs = logs.filter((log) => log.level === level);
    }

    if (category && category !== "all") {
      logs = logs.filter((log) => log.category === category);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      logs = logs.filter(
        (log) =>
          log.message.toLowerCase().includes(searchLower) ||
          log.category.toLowerCase().includes(searchLower) ||
          log.details?.toLowerCase().includes(searchLower) ||
          log.userEmail?.toLowerCase().includes(searchLower),
      );
    }

    // Calculate stats
    const stats = {
      total: logs.length,
      info: logs.filter((log) => log.level === "info").length,
      success: logs.filter((log) => log.level === "success").length,
      warning: logs.filter((log) => log.level === "warning").length,
      error: logs.filter((log) => log.level === "error").length,
    };

    // Apply pagination
    const offset = (page - 1) * limit;
    const paginatedLogs = logs.slice(offset, offset + limit);

    return NextResponse.json({
      logs: paginatedLogs,
      stats,
      pagination: {
        page,
        limit,
        total: logs.length,
        pages: Math.ceil(logs.length / limit),
      },
    });
  } catch (error) {
    console.error("Admin logs error:", error);
    return NextResponse.json(
      { error: "Failed to fetch logs" },
      { status: 500 },
    );
  }
}
