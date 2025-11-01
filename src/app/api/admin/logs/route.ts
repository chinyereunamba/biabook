import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { appointments, businesses, users } from "@/server/db/schema";
import { desc, like, or, and, gte } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    // Check if user is admin
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const level = searchParams.get("level") || "";
    const category = searchParams.get("category") || "";
    const search = searchParams.get("search") || "";

    // For now, we'll generate logs based on real database activity
    // In a production app, you'd have a dedicated logs table

    const logs = [];

    // Get recent appointments for booking logs
    const recentAppointments = await db
      .select({
        id: appointments.id,
        customerName: appointments.customerName,
        customerEmail: appointments.customerEmail,
        status: appointments.status,
        createdAt: appointments.createdAt,
        businessId: appointments.businessId,
      })
      .from(appointments)
      .orderBy(desc(appointments.createdAt))
      .limit(20);

    // Convert appointments to log entries
    recentAppointments.forEach((appointment) => {
      logs.push({
        id: `booking-${appointment.id}`,
        timestamp: appointment.createdAt,
        level: appointment.status === "confirmed" ? "success" : "info",
        category: "booking",
        message: `Appointment ${appointment.status} for ${appointment.customerName}`,
        details: {
          appointmentId: appointment.id,
          customerEmail: appointment.customerEmail,
          status: appointment.status,
        },
        businessId: appointment.businessId,
      });
    });

    // Get recent business registrations
    const recentBusinesses = await db
      .select({
        id: businesses.id,
        name: businesses.name,
        email: businesses.email,
        createdAt: businesses.createdAt,
        ownerId: businesses.ownerId,
      })
      .from(businesses)
      .orderBy(desc(businesses.createdAt))
      .limit(10);

    recentBusinesses.forEach((business) => {
      logs.push({
        id: `business-${business.id}`,
        timestamp: business.createdAt,
        level: "info",
        category: "business",
        message: `New business registration: ${business.name}`,
        details: {
          businessId: business.id,
          businessName: business.name,
          ownerEmail: business.email,
        },
        userId: business.ownerId,
      });
    });

    // Add some mock system logs for demonstration
    const now = new Date();
    const mockLogs = [
      {
        id: "sys-1",
        timestamp: new Date(now.getTime() - 300000).toISOString(),
        level: "error",
        category: "notification",
        message: "WhatsApp API timeout - message delivery failed",
        details: {
          error: "ETIMEDOUT",
          phoneNumber: "+1234567890",
          retryCount: 3,
        },
      },
      {
        id: "sys-2",
        timestamp: new Date(now.getTime() - 600000).toISOString(),
        level: "warning",
        category: "auth",
        message: "Multiple failed login attempts detected",
        details: {
          email: "suspicious@example.com",
          attempts: 5,
          blocked: true,
        },
        ipAddress: "192.168.1.100",
      },
      {
        id: "sys-3",
        timestamp: new Date(now.getTime() - 900000).toISOString(),
        level: "success",
        category: "integration",
        message: "WhatsApp Business API connection verified",
        details: {
          phoneNumberId: "726629333595963",
          businessAccountId: "2247211829061652",
        },
      },
    ];

    logs.push(...mockLogs);

    // Sort logs by timestamp (newest first)
    logs.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    // Apply filters
    let filteredLogs = logs;

    if (level && level !== "all") {
      filteredLogs = filteredLogs.filter((log) => log.level === level);
    }

    if (category && category !== "all") {
      filteredLogs = filteredLogs.filter((log) => log.category === category);
    }

    if (search) {
      filteredLogs = filteredLogs.filter(
        (log) =>
          log.message.toLowerCase().includes(search.toLowerCase()) ||
          log.category.toLowerCase().includes(search.toLowerCase()),
      );
    }

    // Calculate stats
    const stats = {
      total: logs.length,
      errors: logs.filter((l) => l.level === "error").length,
      warnings: logs.filter((l) => l.level === "warning").length,
      success: logs.filter((l) => l.level === "success").length,
      info: logs.filter((l) => l.level === "info").length,
    };

    return NextResponse.json({
      logs: filteredLogs.slice(0, 50), // Limit to 50 logs
      stats,
    });
  } catch (error) {
    console.error("Admin logs error:", error);
    return NextResponse.json(
      { error: "Failed to fetch logs" },
      { status: 500 },
    );
  }
}
