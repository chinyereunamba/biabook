import { describe, it, beforeAll, afterAll, expect } from "vitest";
import request from "supertest";
import { createServer } from "http";
import next from "next";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

let server: any;

beforeAll(async () => {
  await app.prepare();
  server = createServer((req, res) => handle(req, res)).listen(4000);
});

afterAll((done) => {
  server.close(done);
});

describe("NextAuth API", () => {
  it("should return 200 for the auth endpoint", async () => {
    const res = await request(server).get("/api/auth/signin");
    expect(res.status).toBe(200);
    expect(res.text).toContain("Google"); // Should show Google login button
  });

  it("should redirect unauthenticated user from protected route", async () => {
    const res = await request(server).get("/dashboard");
    expect(res.status).toBe(302);
    expect(res.headers.location).toContain("/login");
  });
});
