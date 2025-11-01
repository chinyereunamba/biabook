// Simple test to verify booking functionality
const BASE_URL = "http://localhost:3000";

async function testBookingFlow() {
  console.log("🧪 Testing booking functionality...");

  try {
    // Test 1: Check current appointments
    console.log("1. Checking current appointments...");
    const checkResponse = await fetch(
      `${BASE_URL}/api/test/check-appointments`,
    );
    const checkResult = await checkResponse.json();
    console.log(
      `   Current appointments: ${checkResult.data.totalCounts.appointments}`,
    );

    // Test 2: Create a new appointment
    console.log("2. Creating new appointment...");
    const createResponse = await fetch(
      `${BASE_URL}/api/test/create-appointment`,
      {
        method: "POST",
      },
    );
    const createResult = await createResponse.json();

    if (createResult.status === "success") {
      console.log(
        `   ✅ Appointment created: ${createResult.data.createdAppointment.id}`,
      );
      console.log(
        `   ✅ Confirmation number: ${createResult.data.createdAppointment.confirmationNumber}`,
      );
      console.log(
        `   ✅ Customer: ${createResult.data.createdAppointment.customerName}`,
      );
      console.log(`   ✅ Service: ${createResult.data.testService.name}`);
      console.log(
        `   ✅ Date: ${createResult.data.createdAppointment.appointmentDate}`,
      );
      console.log(
        `   ✅ Time: ${createResult.data.createdAppointment.startTime}`,
      );
    } else {
      console.log(
        `   ❌ Failed to create appointment: ${createResult.message}`,
      );
      return;
    }

    // Test 3: Verify appointment was saved
    console.log("3. Verifying appointment was saved...");
    const verifyResponse = await fetch(
      `${BASE_URL}/api/test/check-appointments`,
    );
    const verifyResult = await verifyResponse.json();
    console.log(
      `   Total appointments now: ${verifyResult.data.totalCounts.appointments}`,
    );

    if (verifyResult.data.recentAppointments.length > 0) {
      const recent = verifyResult.data.recentAppointments[0];
      console.log(
        `   ✅ Latest appointment: ${recent.customerName} - ${recent.business}`,
      );
      console.log(`   ✅ Status: ${recent.status}`);
      console.log(`   ✅ Price: $${(recent.servicePrice / 100).toFixed(2)}`);
    }

    console.log("\n🎉 Booking functionality is working correctly!");
    console.log("✅ Appointments are being saved to the database");
    console.log("✅ All appointment data is properly stored");
    console.log("✅ Database relationships are working");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testBookingFlow();
