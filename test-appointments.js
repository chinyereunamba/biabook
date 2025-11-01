// Simple test script to verify appointment database operations
import { db } from "./src/server/db/index.js";
import {
  appointments,
  businesses,
  services,
  categories,
  users,
} from "./src/server/db/schema.js";

async function testAppointmentOperations() {
  console.log("🧪 Testing appointment database operations...");

  try {
    // Test 1: Check if we can query the appointments table
    console.log("1. Testing appointments table query...");
    const appointmentCount = await db.select().from(appointments);
    console.log(`   Found ${appointmentCount.length} existing appointments`);

    // Test 2: Check if we can query related tables
    console.log("2. Testing related tables...");
    const businessCount = await db.select().from(businesses);
    const serviceCount = await db.select().from(services);
    console.log(
      `   Found ${businessCount.length} businesses, ${serviceCount.length} services`,
    );

    // Test 3: Try to create a test appointment (if we have businesses and services)
    if (businessCount.length > 0 && serviceCount.length > 0) {
      console.log("3. Testing appointment creation...");

      const testBusiness = businessCount[0];
      const testService = serviceCount.find(
        (s) => s.businessId === testBusiness.id,
      );

      if (testService) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const appointmentDate = tomorrow.toISOString().split("T")[0];

        const [newAppointment] = await db
          .insert(appointments)
          .values({
            businessId: testBusiness.id,
            serviceId: testService.id,
            customerName: "Test Customer",
            customerEmail: "test@example.com",
            customerPhone: "5551234567",
            appointmentDate: appointmentDate,
            startTime: "14:00",
            endTime: "15:00",
            status: "confirmed",
            servicePrice: testService.price,
            notes: "Test appointment from script",
          })
          .returning();

        console.log(`   ✅ Created test appointment: ${newAppointment.id}`);

        // Test 4: Verify we can retrieve the appointment
        const retrievedAppointment = await db
          .select()
          .from(appointments)
          .where(appointments.id.eq(newAppointment.id));

        console.log(
          `   ✅ Retrieved appointment: ${retrievedAppointment[0]?.customerName}`,
        );

        // Clean up - delete the test appointment
        await db
          .delete(appointments)
          .where(appointments.id.eq(newAppointment.id));
        console.log(`   🧹 Cleaned up test appointment`);
      } else {
        console.log("   ⚠️  No services found for testing");
      }
    } else {
      console.log("   ⚠️  No businesses or services found for testing");
    }

    console.log("✅ All appointment database tests completed successfully!");
  } catch (error) {
    console.error("❌ Appointment database test failed:", error);
    process.exit(1);
  }
}

testAppointmentOperations();
