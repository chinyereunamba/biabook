/**
 * Test script for geocoding providers
 * Run with: bun run scripts/test-geocoding-providers.ts
 */

import { enhancedGeocodingService } from "../src/lib/api/enhanced-geocoding-service";

async function testGeocodingProviders() {
  console.log("🧪 Testing Geocoding Providers\n");

  // Get provider information
  const providerInfo = enhancedGeocodingService.getProviderInfo();
  console.log("📋 Provider Configuration:");
  console.log(`  Primary: ${providerInfo.primary || "None"}`);
  console.log(`  Fallback: ${providerInfo.fallback || "None"}`);
  console.log(`  Available: ${providerInfo.available.join(", ") || "None"}`);
  console.log(`  Has Configured: ${providerInfo.hasConfigured}\n`);

  if (!providerInfo.hasConfigured) {
    console.log(
      "❌ No providers configured. Please set GOOGLE_MAPS_API_KEY or LOCATIONIQ_API_KEY environment variables.",
    );
    return;
  }

  // Test address
  const testAddress = "1600 Amphitheatre Parkway, Mountain View, CA";
  console.log(`🏠 Testing with address: ${testAddress}\n`);

  try {
    // Test geocoding
    console.log("🔍 Testing geocoding...");
    const coordinates =
      await enhancedGeocodingService.geocodeAddress(testAddress);
    console.log(
      `  ✅ Coordinates: ${coordinates.latitude}, ${coordinates.longitude}`,
    );

    // Test reverse geocoding
    console.log("\n🔄 Testing reverse geocoding...");
    const address = await enhancedGeocodingService.reverseGeocode(coordinates);
    console.log(
      `  ✅ Address: ${address.address}, ${address.city}, ${address.state} ${address.zipCode}`,
    );

    // Test address validation
    console.log("\n✅ Testing address validation...");
    const validation =
      await enhancedGeocodingService.validateAddress(testAddress);
    console.log(`  ✅ Valid: ${validation.isValid}`);
    if (validation.formattedAddress) {
      console.log(`  ✅ Formatted: ${validation.formattedAddress}`);
    }

    // Test timezone
    console.log("\n🌍 Testing timezone detection...");
    const timezone = await enhancedGeocodingService.getTimezone(coordinates);
    console.log(`  ✅ Timezone: ${timezone}`);

    // Test autocomplete
    console.log("\n🔤 Testing address autocomplete...");
    const suggestions =
      await enhancedGeocodingService.getAddressSuggestions("1600 Amphitheatre");
    console.log(`  ✅ Suggestions: ${suggestions.length} found`);
    suggestions.slice(0, 3).forEach((suggestion, index) => {
      console.log(`    ${index + 1}. ${suggestion.description}`);
    });

    console.log("\n🎉 All tests completed successfully!");
  } catch (error) {
    console.error(
      "\n❌ Test failed:",
      error instanceof Error ? error.message : error,
    );
  }
}

// Run the test
testGeocodingProviders().catch(console.error);
