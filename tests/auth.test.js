import request from "supertest";
import { jest } from "@jest/globals";
import { MONGODB_TEST_URL } from "../config/env.config.js";
import { connectDB } from "../connection/db.connection.js";
import mongoose from "mongoose";

const { default: app } = await import("../src/app.js");
// import app from "../src/app.js";

beforeAll(async () => {
  //   await mongoose.connect(MONGODB_URL);
  // console.log("CONNECTING");
  await connectDB(MONGODB_TEST_URL);
  // console.log("-----CONNECTED------");
}, 15000);

afterAll(async () => {
  console.log("Starting cleanup...");

  // Clear all collections
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }

  // Disconnect mongoose
  await mongoose.disconnect();

  // ✅ DISCONNECT REDIS using the helper
  try {
    const { disconnectRedis } = await import("../config/redis.config.js");
    if (disconnectRedis) {
      await disconnectRedis();
      console.log("REDIS DISCONNECTED");
    }
  } catch (error) {
    console.log("Redis disconnect error:", error.message);
  }

  // Clear all timers and mocks
  jest.clearAllTimers();
  jest.clearAllMocks();

  if (global.server) {
    await new Promise((resolve) => global.server.close(resolve));
  }

  console.log("Cleanup complete");
}, 30000);

describe("Auth Api", () => {
  it("should register superadmin", async () => {
    const res = await request(app).post("/api/v1/auth/first-user").send({
      name: "test-super-admin",
      userName: "test_super_admin",
      email: "test-super-admin@example.com",
      password: "aA@#12345",
    });
   
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty(
      "email",
      "test-super-admin@example.com",
    );
  });
}, 15000);
