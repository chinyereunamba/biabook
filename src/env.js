import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    AUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.string().optional(),
    AUTH_GOOGLE_ID: z.string().min(1),
    AUTH_GOOGLE_SECRET: z.string().min(1),
    DATABASE_URL: z
      .string()
      .refine(
        (val) =>
          val.startsWith("file:") ||
          val.startsWith("http") ||
          val.startsWith("libsql:"),
        {
          message: "DATABASE_URL must be a valid URL or a file path",
        },
      ),
    // DATABASE_AUTH_TOKEN: z.strinag(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    // Email configuration
    EMAIL_FROM: z.string().email().optional(),
    EMAIL_SERVER_HOST: z.string().optional(),
    EMAIL_SERVER_PORT: z.string().optional(),
    EMAIL_SERVER_USER: z.string().optional(),
    EMAIL_SERVER_PASSWORD: z.string().optional(),

    // WhatsApp Business API configuration
    WHATSAPP_API_URL: z.string().url().optional(),
    WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
    WHATSAPP_BUSINESS_ACCOUNT_ID: z.string().optional(),
    WHATSAPP_ACCESS_TOKEN: z.string().optional(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    // DATABASE_AUTH_TOKEN: process.env.DATABASE_AUTH_TOKEN,
    NODE_ENV: process.env.NODE_ENV,
    // Email configuration
    EMAIL_FROM: process.env.EMAIL_FROM,
    EMAIL_SERVER_HOST: process.env.EMAIL_SERVER_HOST,
    EMAIL_SERVER_PORT: process.env.EMAIL_SERVER_PORT,
    EMAIL_SERVER_USER: process.env.EMAIL_SERVER_USER,
    EMAIL_SERVER_PASSWORD: process.env.EMAIL_SERVER_PASSWORD,

    // WhatsApp Business API configuration
    WHATSAPP_API_URL: process.env.WHATSAPP_API_URL,
    WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
    WHATSAPP_BUSINESS_ACCOUNT_ID: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
    WHATSAPP_ACCESS_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
