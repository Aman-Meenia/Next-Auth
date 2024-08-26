import mongoose, { Schema, Document } from "mongoose";
import { z } from "zod";

const userSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters long")
      .regex(
        /^[a-z0-9@]+$/,
        "Username must only contain lowercase letters, numbers, and @",
      ),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    otp: z.string(),
    otp_expiry: z.date(),
    isVerified: z.boolean().default(false),
    role: z.enum(["admin", "user"]).default("user"),
  })
  .strict();

export interface UserType extends Document, z.infer<typeof userSchema> {}
const mongooseSchema: Schema<UserType> = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    otp: { type: String, required: true },
    otp_expiry: { type: Date, required: true },
    isVerified: { type: Boolean, default: false },
    role: { type: String, enum: ["admin", "user"], default: "user" },
  },
  { timestamps: true },
);

const User =
  (mongoose.models.User as mongoose.Model<UserType>) ||
  mongoose.model<UserType>("User", mongooseSchema);
export default User;
