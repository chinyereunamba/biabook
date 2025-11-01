// Test admin API endpoints
const BASE_URL = "http://localhost:3000";

async function testAdminAPI() {
  console.log("🧪 Testing Admin API endpoints...");

  try {
    // Test 1: Admin Stats
    console.log("1. Testing admin stats...");
    const statsResponse = await fetch(`${BASE_URL}/api/admin/stats`);
    if (statsResponse.ok) {
      const stats = await statsResponse.json();
      console.log("   ✅ Stats API working:");
      console.log(`   - Total Businesses: ${stats.overview.totalBusinesses}`);
      console.log(`   - Total Users: ${stats.overview.totalUsers}`);
      console.log(
        `   - Total Appointments: ${stats.overview.totalAppointments}`,
      );
      console.log(
        `   - Total Revenue: $${(stats.overview.totalRevenue / 100).toFixed(2)}`,
      );
    } else {
      console.log(`   ❌ Stats API failed: ${statsResponse.status}`);
    }

    // Test 2: Admin Users
    console.log("2. Testing admin users...");
    const usersResponse = await fetch(`${BASE_URL}/api/admin/users`);
    if (usersResponse.ok) {
      const users = await usersResponse.json();
      console.log("   ✅ Users API working:");
      console.log(`   - Total Users: ${users.summary?.total || 0}`);
      console.log(`   - Onboarded: ${users.summary?.onboarded || 0}`);
      console.log(
        `   - Business Owners: ${users.summary?.businessOwners || 0}`,
      );
    } else {
      const error = await usersResponse.text();
      console.log(`   ❌ Users API failed: ${usersResponse.status} - ${error}`);
    }

    // Test 3: Admin Businesses
    console.log("3. Testing admin businesses...");
    const businessesResponse = await fetch(`${BASE_URL}/api/admin/businesses`);
    if (businessesResponse.ok) {
      const businesses = await businessesResponse.json();
      console.log("   ✅ Businesses API working:");
      console.log(
        `   - Total Businesses: ${businesses.businesses?.length || 0}`,
      );
    } else {
      const error = await businessesResponse.text();
      console.log(
        `   ❌ Businesses API failed: ${businessesResponse.status} - ${error}`,
      );
    }

    console.log("\n🎉 Admin API testing completed!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testAdminAPI();
