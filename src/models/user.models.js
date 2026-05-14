import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { user_roles_enum } from "../utils/constants.utils.js";
import {
  JWT_EXPIRES_IN,
  JWT_SECRET,
  REFRESH_TOKEN_EXPIRES,
  REFRESH_TOKEN_SECRET,
} from "../../config/env.config.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    userName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    avatar: {
      type: String, // cloudinary url
      default: null,
    },

    role: {
      type: String,
      enum: user_roles_enum,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationOtp: {
      type: String,
    },

    emailVerificationOtpExpiry: {
      type: Date,
    },

    refreshToken: {
      type: String,
    },

    forgotPasswordOtp: {
      type: String,
    },

    forgotPasswordOtpExpiry: {
      type: Date,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // null for super_admin since no one creates them
    },
  },
  { timestamps: true },
);

// hash password before save
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign({ _id: this._id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ _id: this._id }, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES,
  });
};

userSchema.methods.generateOTP = function () {
  const num = crypto.randomInt(100000, 999999);
  const hashed = crypto
    .createHash("sha256")
    .update(num.toString())
    .digest("hex");
  this.emailVerificationOtp = hashed;
  this.emailVerificationOtpExpiry = Date.now() + 10 * 60 * 1000; // 10 mins
  return num; // send plain OTP to email, store hashed
};

userSchema.methods.generateForgotOTP = function () {
  const num = crypto.randomInt(100000, 999999);
  const hashed = crypto
    .createHash("sha256")
    .update(num.toString())
    .digest("hex");
  this.forgotPasswordOtp = hashed;
  this.forgotPasswordOtpExpiry = Date.now() + 10 * 60 * 1000;
  return num;
};

const User = mongoose.model("User", userSchema);
export default User;
