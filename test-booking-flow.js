// Simple test script to test the booking flow
const BASE_URL = "http://localhost:3000";

async function testBookingFlow() {
  console.log("🧪 Testing booking flow...");

  try {
    // Step 1: Create a test appointment
    console.log("1. Creating test appointment...");
    const createResponse = await fetch(
      `${BASE_URL}/api/test/create-appointment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error("Failed to create test appointment:", errorText);
      return;
    }

    const createResult = await createResponse.json();
    console.log(
      "✅ Test appointment created:",
      createResult.data.createdAppointment.id,
    );

    const appointmentId = createResult.data.createdAppointment.id;

    // Step 2: Test the cancel endpoint
    console.log("2. Testing cancel endpoint...");
    const cancelResponse = await fetch(
      `${BASE_URL}/api/bookings/${appointmentId}/cancel`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!cancelResponse.ok) {
      const errorText = await cancelResponse.text();
      console.error("Cancel endpoint failed:", errorText);
      return;
    }

    const cancelResult = await cancelResponse.json();
    console.log("✅ Cancel endpoint working:", cancelResult.message);

    // Step 3: Check appointments status
    console.log("3. Checking appointments status...");
    const checkResponse = await fetch(
      `${BASE_URL}/api/test/check-appointments`,
    );

    if (checkResponse.ok) {
      const checkResult = await checkResponse.json();
      console.log("✅ Appointments check:", checkResult.data.totalCounts);
    }

    console.log("🎉 All tests completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

// Run the test
testBookingFlow();
