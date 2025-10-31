import { NextRequest, NextResponse } from "next/server";
import { whatsAppService } from "@/server/notifications/whatsapp-service";

/**
 * Test WhatsApp configuration
 * GET /api/test/whatsapp?phone=1234567890
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 },
      );
    }

    // Create test appointment data
    const testAppointment = {
      id: "test-123",
      customerName: "Test Customer",
      customerEmail: "test@example.com",
      customerPhone: phone,
      appointmentDate: new Date(),
      startTime: "10:00",
      endTime: "11:00",
      status: "confirmed" as const,
      notes: "Test booking",
    };

    const testService = {
      id: "service-123",
      name: "Test Service",
      duration: 60,
      price: 5000, // $50.00
    };

    const testBusiness = {
      id: "business-123",
      name: "Test Business",
      phone: phone,
      email: "business@example.com",
    };

    // Try to send a test WhatsApp message
    const result = await whatsAppService.sendNewBookingNotification(
      testAppointment,
      testService,
      testBusiness,
    );

    return NextResponse.json({
      success: result,
      message: result
        ? "WhatsApp test message sent successfully!"
        : "WhatsApp message failed to send. Check your configuration and templates.",
      phone: phone,
    });
  } catch (error) {
    console.error("WhatsApp test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "WhatsApp test failed",
      },
      { status: 500 },
    );
  }
}
