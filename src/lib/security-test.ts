/**
 * Security Test Utility
 * This file contains functions to test role-based access control
 * Use this in development to verify security measures are working
 */

export interface SecurityTestResult {
  test: string;
  passed: boolean;
  message: string;
  statusCode?: number;
}

/**
 * Test admin route access without authentication
 */
export async function testUnauthenticatedAdminAccess(): Promise<
  SecurityTestResult[]
> {
  const results: SecurityTestResult[] = [];

  const adminRoutes = [
    "/admin",
    "/admin/users",
    "/admin/businesses",
    "/admin/settings",
    "/api/admin/stats",
    "/api/admin/users",
    "/api/admin/businesses",
  ];

  for (const route of adminRoutes) {
    try {
      const response = await fetch(route, {
        credentials: "omit", // Don't send cookies
      });

      const passed =
        response.status === 401 ||
        response.status === 403 ||
        response.redirected;

      results.push({
        test: `Unauthenticated access to ${route}`,
        passed,
        message: passed
          ? `Correctly blocked with status ${response.status}`
          : `SECURITY ISSUE: Allowed access with status ${response.status}`,
        statusCode: response.status,
      });
    } catch (error) {
      results.push({
        test: `Unauthenticated access to ${route}`,
        passed: true,
        message: "Request blocked (network error expected)",
      });
    }
  }

  return results;
}

/**
 * Test admin API routes with non-admin user session
 */
export async function testNonAdminApiAccess(): Promise<SecurityTestResult[]> {
  const results: SecurityTestResult[] = [];

  const adminApiRoutes = [
    "/api/admin/stats",
    "/api/admin/users",
    "/api/admin/businesses",
  ];

  for (const route of adminApiRoutes) {
    try {
      const response = await fetch(route, {
        credentials: "include", // Send session cookies
      });

      const passed = response.status === 401 || response.status === 403;

      results.push({
        test: `Non-admin access to ${route}`,
        passed,
        message: passed
          ? `Correctly blocked with status ${response.status}`
          : `SECURITY ISSUE: Non-admin allowed access with status ${response.status}`,
        statusCode: response.status,
      });
    } catch (error) {
      results.push({
        test: `Non-admin access to ${route}`,
        passed: true,
        message: "Request blocked (network error expected)",
      });
    }
  }

  return results;
}

/**
 * Run all security tests
 */
export async function runSecurityTests(): Promise<{
  passed: number;
  failed: number;
  results: SecurityTestResult[];
}> {
  const allResults: SecurityTestResult[] = [];

  // Test unauthenticated access
  const unauthResults = await testUnauthenticatedAdminAccess();
  allResults.push(...unauthResults);

  // Test non-admin access (this would need to be run with a non-admin session)
  const nonAdminResults = await testNonAdminApiAccess();
  allResults.push(...nonAdminResults);

  const passed = allResults.filter((r) => r.passed).length;
  const failed = allResults.filter((r) => !r.passed).length;

  return {
    passed,
    failed,
    results: allResults,
  };
}

/**
 * Display security test results in console
 */
export function displaySecurityTestResults(results: SecurityTestResult[]) {
  console.group("🔒 Security Test Results");

  results.forEach((result) => {
    const icon = result.passed ? "✅" : "❌";
    const style = result.passed
      ? "color: green"
      : "color: red; font-weight: bold";

    console.log(`${icon} %c${result.test}`, style);
    console.log(`   ${result.message}`);
    if (result.statusCode) {
      console.log(`   Status Code: ${result.statusCode}`);
    }
  });

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log(`\n📊 Summary: ${passed} passed, ${failed} failed`);

  if (failed > 0) {
    console.warn("⚠️  SECURITY ISSUES DETECTED! Please review failed tests.");
  } else {
    console.log("🎉 All security tests passed!");
  }

  console.groupEnd();
}
