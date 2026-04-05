import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { sendNotification } from "../../../inngest/functions";

// Configure Next.js Webhook handler for Inngest Serverless functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [sendNotification],
});
