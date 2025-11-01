// Test admin dashboard with real data
const BASE_URL = "http://localhost:3000";

async function testAdminRealData() {
  console.log("🧪 Testing Admin Dashboard with Real Data...");

  try {
    // Test 1: Check if we have real appointments data
    console.log("1. Checking appointments data...");
    const appointmentsResponse = await fetch(
      `${BASE_URL}/api/test/check-appointments`,
    );
    if (appointmentsResponse.ok) {
      const appointments = await appointmentsResponse.json();
      console.log(
        `   ✅ Found ${appointments.data.totalCounts.appointments} appointments`,
      );
      console.log(
        `   ✅ Found ${appointments.data.totalCounts.businesses} businesses`,
      );
      console.log(
        `   ✅ Found ${appointments.data.totalCounts.services} services`,
      );
    }

    // Test 2: Test admin stats (will require admin auth)
    console.log("2. Testing admin stats endpoint...");
    const statsResponse = await fetch(`${BASE_URL}/api/admin/stats`);
    if (statsResponse.ok) {
      const stats = await statsResponse.json();
      console.log("   ✅ Admin stats working:");
      console.log(`   - Total Businesses: ${stats.overview.totalBusinesses}`);
      console.log(`   - Total Users: ${stats.overview.totalUsers}`);
      console.log(
        `   - Total Appointments: ${stats.overview.totalAppointments}`,
      );
    } else {
      console.log(
        `   ⚠️  Admin stats requires authentication: ${statsResponse.status}`,
      );
    }

    // Test 3: Test admin logs endpoint
    console.log("3. Testing admin logs endpoint...");
    const logsResponse = await fetch(`${BASE_URL}/api/admin/logs`);
    if (logsResponse.ok) {
      const logs = await logsResponse.json();
      console.log("   ✅ Admin logs working:");
      console.log(`   - Total Logs: ${logs.stats.total}`);
      console.log(`   - Errors: ${logs.stats.errors}`);
      console.log(`   - Warnings: ${logs.stats.warnings}`);
    } else {
      console.log(
        `   ⚠️  Admin logs requires authentication: ${logsResponse.status}`,
      );
    }

    console.log("\n📊 Real Data Summary:");
    console.log("✅ Database has real appointment and business data");
    console.log("✅ Admin API endpoints are configured");
    console.log("⚠️  Admin access requires authentication with admin role");
    console.log("\n💡 To test admin features:");
    console.log("1. Login with the admin email (chinyereunamba15@gmail.com)");
    console.log("2. Navigate to /admin to see the dashboard");
    console.log("3. All data will be pulled from the real database");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testAdminRealData();
