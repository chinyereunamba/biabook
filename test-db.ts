import { createClient } from "@libsql/client";
import "dotenv/config";

const url = process.env.DATABASE_URL;
const authToken = process.env.DATABASE_AUTH_TOKEN;

console.log("Connecting to:", url);

if (!url) {
  console.error("DATABASE_URL is not defined in .env");
  process.exit(1);
}

const client = createClient({
  url,
  authToken,
});

async function test() {
  try {
    console.log("Starting query...");
    const start = Date.now();
    const result = await client.execute("SELECT 1");
    const end = Date.now();
    console.log("Query successful:", result.rows);
    console.log(`Time taken: ${end - start}ms`);
  } catch (err) {
    console.error("Query failed:");
    console.error(err);
  } finally {
    // client.close() is not needed for http/libsql client in most versions but let's be safe if possible
  }
}

test();
