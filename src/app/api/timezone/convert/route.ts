/**
 * API endpoints for timezone conversion operations
 */

import { NextRequest, NextResponse } from "next/server";
import { timezoneService } from "@/lib/timezone-service";
import {
  convertAppointmentTimezones,
  createAppointmentBookingPayload,
  validateAppointmentTimeFormat,
} from "@/lib/timezone-utils";
import { LocationError } from "@/types/location";
import { isValidTimezone } from "@/lib/location-validation";

/**
 * POST /api/timezone/convert - Convert appointment time between timezones
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      date,
      time,
      businessTimezone,
      customerTimezone,
      operation = "convert",
    } = body;

    // Validate required fields
    if (!date || !time || !businessTimezone) {
      return NextResponse.json(
        { error: "Date, time, and business timezone are required" },
        { status: 400 },
      );
    }

    // Validate time format
    if (!validateAppointmentTimeFormat(date, time)) {
      return NextResponse.json(
        {
          error:
            "Invalid date or time format. Use YYYY-MM-DD for date and HH:MM for time",
        },
        { status: 400 },
      );
    }

    // Validate timezones
    if (!isValidTimezone(businessTimezone)) {
      return NextResponse.json(
        { error: "Invalid business timezone" },
        { status: 400 },
      );
    }

    if (customerTimezone && !isValidTimezone(customerTimezone)) {
      return NextResponse.json(
        { error: "Invalid customer timezone" },
        { status: 400 },
      );
    }

    if (operation === "booking-payload") {
      // Create complete booking payload with timezone information
      const payload = await createAppointmentBookingPayload(
        date,
        time,
        businessTimezone,
        customerTimezone,
      );

      return NextResponse.json(payload);
    } else {
      // Standard timezone conversion
      const conversion = await convertAppointmentTimezones(
        date,
        time,
        businessTimezone,
        customerTimezone,
      );

      return NextResponse.json(conversion);
    }
  } catch (error) {
    console.error("Timezone conversion error:", error);

    if (error instanceof LocationError) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          fallbackAction: error.fallbackAction,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to convert timezone" },
      { status: 500 },
    );
  }
}
