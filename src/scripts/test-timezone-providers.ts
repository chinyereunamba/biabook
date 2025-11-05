#!/usr/bin/env bun

/**
 * Test script for timezone providers
 * Usage: bun run src/scripts/test-timezone-providers.ts
 */

import {
  detectTimezone,
  detectTimezoneWithProvider,
  getAvailableTimezoneProviders,
} from "@/lib/timezone-service";

// Test coordinates for different locations
const testLocations = [
  { name: "New York", lat: 40.7128, lng: -74.006 },
  { name: "London", lat: 51.5074, lng: -0.1278 },
  { name: "Tokyo", lat: 35.6762, lng: 139.6503 },
  { name: "Sydney", lat: -33.8688, lng: 151.2093 },
  { name: "Los Angeles", lat: 34.0522, lng: -118.2437 },
];

async function testProviders() {
  console.log("🌍 Testing Timezone Providers\n");

  // Show available providers
  console.log("📋 Available Providers:");
  const providers = getAvailableTimezoneProviders();
  providers.forEach((provider) => {
    const status = provider.available ? "✅ Available" : "❌ Not Available";
    console.log(`  ${provider.name}: ${status}`);
  });
  console.log();

  // Test each location with auto-fallback
  console.log("🔄 Testing Auto-Fallback Detection:");
  for (const location of testLocations) {
    try {
      const timezone = await detectTimezone({
        latitude: location.lat,
        longitude: location.lng,
      });
      console.log(`  ${location.name}: ${timezone}`);
    } catch (error) {
      console.log(
        `  ${location.name}: ❌ ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
  console.log();

  // Test specific providers if available
  const availableProviders = providers.filter((p) => p.available);

  if (availableProviders.length > 0) {
    console.log("🎯 Testing Specific Providers:");

    for (const provider of availableProviders) {
      console.log(`\n  Testing ${provider.name}:`);

      for (const location of testLocations.slice(0, 2)) {
        // Test first 2 locations only
        try {
          const result = await detectTimezoneWithProvider(
            { latitude: location.lat, longitude: location.lng },
            provider.name,
          );
          console.log(
            `    ${location.name}: ${result.timezone} (via ${result.provider})`,
          );
        } catch (error) {
          console.log(
            `    ${location.name}: ❌ ${error instanceof Error ? error.message : "Unknown error"}`,
          );
        }
      }
    }
  }

  console.log("\n✅ Timezone provider testing completed!");
}

// Run the test
testProviders().catch((error) => {
  console.error("❌ Test failed:", error);
  process.exit(1);
});
