import request from "supertest";
import { it, jest } from "@jest/globals";
import { MONGODB_TEST_URL } from "../config/env.config.js";
import { connectDB } from "../connection/db.connection.js";
import mongoose from "mongoose";
import crypto from "crypto";
import User from "../src/models/user.models.js";

const { default: app } = await import("../src/app.js");
// import app from "../src/app.js";

beforeAll(async () => {
  //   await mongoose.connect(MONGODB_URL);
  // console.log("CONNECTING");
  await connectDB(MONGODB_TEST_URL);
  await User.deleteMany();
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

async function register_SuperAdmin() {
  await request(app).post("/api/v1/auth/first-user").send({
    name: "test-super-admin",
    userName: "test_super_admin",
    email: "test-super-admin@example.com",
    password: "aA@#12345",
  });
}

async function verify() {
  const otp = 123456;

  const hashedOTP = crypto
    .createHash("sha256")
    .update(otp.toString())
    .digest("hex");

  await User.findOneAndUpdate(
    {
      email: "test-super-admin@example.com",
    },
    {
      emailVerificationOtp: hashedOTP,
      emailVerificationOtpExpiry: Date.now() + 5 * 60 * 1000,
    },
  );

  await request(app).post("/api/v1/auth/verify").send({ otp: otp });
}

async function register_verify() {
  await register_SuperAdmin();
  await verify();
}

async function logIn() {
  const res = await request(app).post("/api/v1/auth/log-in").send({
    email: "test-super-admin@example.com",
    password: "aA@#12345",
  });

  return res.headers["set-cookie"];
}

async function create_student() {
  const cookies = await logIn();

  const res = await request(app)
    .post("/api/v1/auth/create-user")
    .send({
      name: "student-1",
      userName: "student1",
      email: "student-1@example.com",
      password: "aA@#12345",
      role: "student",
    })
    .set("Cookie", cookies);

  // console.log("RES STATUS-> ", res.error);
  console.log("RES STATUS-> ", res.error);

  expect(res.status).toBe(201);
  expect(res.body.data).toHaveProperty("email", "student-1@example.com");

  return res.body.data;
}

describe("STUDENT API", () => {
  it("Set Student Profile.", async () => {
    await register_verify();
    const cookies = await logIn();

    // const user = await User.findOne({ email: "student-1@example.com" });
    // console.log("USER -> ", user);
    // user_id = user._id.toString();

    const a = await create_student();

    const user_id = a._id;

    console.log("A --> ", a);
    console.log("A --> ", user_id);

    const res = await request(app)
      .post(`/api/v1/student/setup/${user_id}`)
      .send({
        studentType: "school",
        board: "WB",
        standard: "10",
        stream: "SCIENCE",
      })
      .set("Cookie", cookies);

    console.log("USER -> ", res.error);
    expect(res.status).toBe(201);
  });
}, 15000);
