import { vi } from "vitest";

// Mock environment variables for tests
vi.mock("@/env", () => ({
  env: {
    DATABASE_URL: ":memory:",
    NEXTAUTH_SECRET: "test-secret",
    NEXTAUTH_URL: "http://localhost:3000",
    GOOGLE_CLIENT_ID: "test-google-client-id",
    GOOGLE_CLIENT_SECRET: "test-google-client-secret",
    EMAIL_SERVER_HOST: "smtp.example.com",
    EMAIL_SERVER_PORT: "587",
    EMAIL_SERVER_USER: "test@example.com",
    EMAIL_SERVER_PASSWORD: "password123",
    EMAIL_FROM: "noreply@bookme.example.com",
    WHATSAPP_API_URL: "https://graph.facebook.com/v18.0",
    WHATSAPP_PHONE_NUMBER_ID: "test-phone-id",
    WHATSAPP_BUSINESS_ACCOUNT_ID: "test-business-id",
    WHATSAPP_ACCESS_TOKEN: "test-access-token",
    NEXT_PUBLIC_APP_URL: "https://bookme.example.com",
  },
}));

// Mock fetch globally
global.fetch = vi.fn();

// Mock crypto.randomUUID for consistent test IDs
Object.defineProperty(global, "crypto", {
  value: {
    randomUUID: vi.fn(() => "test-uuid-123"),
  },
});
