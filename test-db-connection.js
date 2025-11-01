// Quick test script to check database connection
import { createClient } from "@libsql/client";

async function testConnection() {
  console.log("Testing database connection...");

  try {
    // Test local SQLite
    const client = createClient({
      url: "file:./db.sqlite",
      intMode: "number",
    });

    const result = await client.execute(
      "SELECT name FROM sqlite_master WHERE type='table' LIMIT 5",
    );
    console.log("✅ Local SQLite connection successful!");
    console.log(
      "Tables found:",
      result.rows.map((row) => row.name),
    );

    // Check if businesses table exists
    const tableCheck = await client.execute(
      "SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%business%'",
    );
    console.log(
      "Business-related tables:",
      tableCheck.rows.map((row) => row.name),
    );

    if (tableCheck.rows.length > 0) {
      const businessTest = await client.execute(
        "SELECT COUNT(*) as count FROM biabook_businesses",
      );
      console.log("Business count:", businessTest.rows[0]?.count || 0);
    } else {
      console.log("No business tables found - database may need migration");
    }
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
  }
}

testConnection();
