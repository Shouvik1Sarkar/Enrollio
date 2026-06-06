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

// async function logIn1() {
//   await register_SuperAdmin();
//   await verify();

//   const res = await request(app).post("/api/v1/auth/log-in").send({
//     email: "test-super-admin@example.com",
//     password: "aA@#12345",
//   });

//   return res.headers["set-cookie"];
// }
async function logIn() {
  const res = await request(app).post("/api/v1/auth/log-in").send({
    email: "test-super-admin@example.com",
    password: "aA@#12345",
  });

  return res.headers["set-cookie"];
}

describe("User API", () => {
  it("Get User profile.", async () => {
    await register_verify();
    const cookies = await logIn();
    const res = await request(app)
      .get("/api/v1/user/me")
      .set("Cookie", cookies);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty(
      "email",
      "test-super-admin@example.com",
    );
  });

  it("Update User profile.", async () => {
    const cookies = await logIn();
    const res = await request(app)
      .patch("/api/v1/user/update")
      .send({
        userName: "updated_user",
      })
      .set("Cookie", cookies);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("userName", "updated_user");
  });

  it("All Users profile.", async () => {
    const cookies = await logIn();
    const res = await request(app)
      .get("/api/v1/user/all-users")
      .set("Cookie", cookies);

    console.log("ERROR: ", res.error);
    expect(res.status).toBe(200);
  });

  it("User by user Name", async () => {
    const cookies = await logIn();
    const res = await request(app)
      .post("/api/v1/user/username")
      .send({
        user_name: "updated_user",
      })
      .set("Cookie", cookies);

    expect(res.status).toBe(200);
  });

  it("User by user id", async () => {
    const cookies = await logIn();

    const user = await User.findOne({ email: "test-super-admin@example.com" });
    user_id = user._id.toString();

    const res = await request(app)
      .get(`/api/v1/user/${user_id}`)

      .set("Cookie", cookies);

    expect(res.status).toBe(200);
  });
}, 15000);
