/**
 * API endpoints for business timezone management
 */

import { NextRequest, NextResponse } from "next/server";
import { timezoneService } from "@/lib/timezone-service";
import { timezoneRepository } from "@/server/repositories/timezone-repository";
import { LocationError } from "@/types/location";
import { isValidTimezone } from "@/lib/location-validation";

/**
 * PUT /api/timezone/business - Update business timezone
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessId, timezone } = body;

    // Validate required fields
    if (!businessId || !timezone) {
      return NextResponse.json(
        { error: "Business ID and timezone are required" },
        { status: 400 },
      );
    }

    // Validate timezone
    if (!isValidTimezone(timezone)) {
      return NextResponse.json({ error: "Invalid timezone" }, { status: 400 });
    }

    // Get current timezone for comparison
    const currentTimezone =
      await timezoneRepository.getBusinessTimezone(businessId);

    // Update business timezone
    const result = await timezoneRepository.updateBusinessTimezone(
      businessId,
      timezone,
    );

    // If timezone changed, update appointment timezones
    if (currentTimezone && currentTimezone !== timezone) {
      try {
        await timezoneService.updateAppointmentTimezones(businessId, timezone);

        // Get affected appointments count for logging
        const futureAppointments =
          await timezoneRepository.getFutureAppointments(businessId);

        // Log the timezone change
        await timezoneRepository.logTimezoneChange(
          businessId,
          currentTimezone,
          timezone,
          futureAppointments.length,
        );

        return NextResponse.json({
          ...result,
          timezoneChanged: true,
          affectedAppointments: futureAppointments.length,
          message: `Timezone updated successfully. ${futureAppointments.length} future appointments will use the new timezone.`,
        });
      } catch (error) {
        console.error("Failed to update appointment timezones:", error);

        // Still return success for the timezone update, but note the appointment update issue
        return NextResponse.json({
          ...result,
          timezoneChanged: true,
          warning:
            "Timezone updated but there was an issue updating appointment timezones. Please contact support.",
        });
      }
    }

    return NextResponse.json({
      ...result,
      timezoneChanged: false,
      message: "Timezone updated successfully.",
    });
  } catch (error) {
    console.error("Update business timezone error:", error);

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
      { error: "Failed to update business timezone" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/timezone/business?businessId=xxx - Get business timezone with appointment info
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get("businessId");

    if (!businessId) {
      return NextResponse.json(
        { error: "Business ID is required" },
        { status: 400 },
      );
    }

    // Get business timezone
    const timezone = await timezoneRepository.getBusinessTimezone(businessId);

    if (!timezone) {
      return NextResponse.json(
        { error: "Business timezone not found" },
        { status: 404 },
      );
    }

    // Get future appointments count
    const futureAppointments =
      await timezoneRepository.getFutureAppointments(businessId);

    return NextResponse.json({
      businessId,
      timezone,
      futureAppointmentsCount: futureAppointments.length,
      isValidTimezone: isValidTimezone(timezone),
    });
  } catch (error) {
    console.error("Get business timezone info error:", error);

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
      { error: "Failed to get business timezone info" },
      { status: 500 },
    );
  }
}
