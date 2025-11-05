import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { serviceRadiusValidationService } from "@/server/services/service-radius-validation";
import { withErrorHandler } from "@/app/api/_middleware/error-handler";
import { BookingErrors } from "@/server/errors/booking-errors";

// Validation schema for location validation request
const validateLocationSchema = z.object({
  businessId: z.string().min(1, "Business ID is required"),
  customerLocation: z.object({
    latitude: z.number().min(-90).max(90, "Invalid latitude"),
    longitude: z.number().min(-180).max(180, "Invalid longitude"),
  }),
  includeAlternatives: z.boolean().optional().default(false),
  maxAlternativeRadius: z.number().min(1).max(500).optional().default(50),
  maxAlternatives: z.number().min(1).max(20).optional().default(5),
});

async function validateLocationHandler(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = validateLocationSchema.safeParse(body);
    if (!validationResult.success) {
      const fieldErrors = validationResult.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      throw BookingErrors.validation(
        "Invalid location validation request",
        "request_body",
        fieldErrors.map((e) => `${e.field}: ${e.message}`),
      );
    }

    const {
      businessId,
      customerLocation,
      includeAlternatives,
      maxAlternativeRadius,
      maxAlternatives,
    } = validationResult.data;

    // Validate the booking location
    const validationOptions = {
      includeAlternatives,
      maxAlternativeRadius,
      maxAlternatives,
    };

    const result = await serviceRadiusValidationService.validateBookingLocation(
      businessId,
      customerLocation,
      validationOptions,
    );

    return NextResponse.json({
      validation: result,
      canBook: result.isValid,
      message: result.isValid
        ? `You are ${result.distance} miles from ${result.businessName}`
        : `You are ${result.distance} miles from ${result.businessName}, which is outside their ${result.serviceRadius ? `${result.serviceRadius} mile` : "unlimited"} service area.`,
    });
  } catch (error) {
    console.error("Error validating booking location:", error);

    if (error instanceof Error) {
      if (error.message.includes("Business not found")) {
        throw BookingErrors.businessNotFound("");
      }
      if (error.message.includes("Invalid customer coordinates")) {
        throw BookingErrors.validation(
          "Invalid location coordinates provided",
          "customerLocation",
          ["Please provide valid latitude and longitude coordinates"],
        );
      }
    }

    throw BookingErrors.validation(
      "Failed to validate booking location",
      "location",
      ["Please try again or contact support"],
    );
  }
}

export const POST = withErrorHandler(validateLocationHandler);
