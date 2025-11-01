import { client } from "./index";

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    // Simple query to test connection
    const result = await client.execute("SELECT 1 as test");
    return result.rows.length > 0;
  } catch (error) {
    console.error("Database connection test failed:", error);
    return false;
  }
}

/**
 * Get connection status with details
 */
export async function getConnectionStatus() {
  try {
    const start = Date.now();
    const result = await client.execute("SELECT 1 as test");
    const duration = Date.now() - start;

    return {
      connected: true,
      duration,
      message: `Connected successfully in ${duration}ms`,
    };
  } catch (error) {
    return {
      connected: false,
      duration: 0,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
