import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ResponseType } from "../Types/ResponseType";
import dbConnect from "@/db/dbConnect";
import User from "@/models/userModel";
import { fromZodError } from "zod-validation-error";

const userInputTypeValidation = z
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
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters long"),
  })
  .strict();

type userInputType = z.infer<typeof userInputTypeValidation>;

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body: userInputType = await req.json();

    const zodResponse = userInputTypeValidation.safeParse(body);
    if (zodResponse.success === false) {
      console.log(fromZodError(zodResponse?.error).message);
      const errorResponse: ResponseType = {
        message: fromZodError(zodResponse?.error).message,
        success: false,
        statusCode: 400,
      };
      return NextResponse.json(errorResponse);
    }
    console.log(body);
    // check whether password and confirm password match

    if (body.password !== body.confirmPassword) {
      const errorResponse: ResponseType = {
        message: "Passwords do not match",
        success: false,
        statusCode: 400,
      };
      return NextResponse.json(errorResponse);
    }

    // Generate Otp

    const otp = generateOTP();

    // Generate Otp Expiry Time

    const otpExpiryTime = generateOTPExpiryTime();

    // check whether username or email already exists

    let userFind = await User.findOne({ username: body.username });

    if (userFind?.isVerified === true) {
      const errorResponse: ResponseType = {
        message: "Username already exists",
        success: false,
        statusCode: 400,
      };
      return NextResponse.json(errorResponse);
    }

    // if the otp is not expired we cannot use that same name

    if (
      userFind?.otp_expiry !== undefined &&
      userFind?.otp_expiry > new Date()
    ) {
      const errorResponse: ResponseType = {
        message: "Username already exists",
        success: false,
        statusCode: 400,
      };
      return NextResponse.json(errorResponse);
    }

    // if username is present but not verified and otp is expoired than we can use that username

    if (userFind) {
      userFind.username = body.username;
      userFind.email = body.email;
      userFind.password = body.password;
      userFind.otp = otp;
      userFind.otp_expiry = otpExpiryTime;
      await userFind.save();
      //TODO: send otp to user

      const successResponse: ResponseType = {
        message: "User created successfully",
        success: true,
        statusCode: 200,
        messages: [{ userFind }],
      };

      return NextResponse.json(successResponse);
    }

    // if same email exists check if the user is verified
    userFind = await User.findOne({ email: body.email });

    if (userFind?.isVerified === true) {
      const errorResponse: ResponseType = {
        message: "Account with this email already exists",
        success: false,
        statusCode: 400,
      };
      return NextResponse.json(errorResponse);
    }

    // if the otp is not expired we cannot use that same email

    if (
      userFind?.otp_expiry !== undefined &&
      userFind?.otp_expiry > new Date()
    ) {
      const errorResponse: ResponseType = {
        message:
          "Account with this email already exists , please verify your account",
        success: false,
        statusCode: 400,
      };
      return NextResponse.json(errorResponse);
    }

    // if username is present but not verified and otp is expoired than we can use that username

    if (userFind) {
      userFind.username = body.username;
      userFind.email = body.email;
      userFind.password = body.password;
      userFind.otp = otp;
      userFind.otp_expiry = otpExpiryTime;
      await userFind.save();
      //TODO: send otp to user

      const successResponse: ResponseType = {
        message: "User created successfully",
        success: true,
        statusCode: 200,
        messages: [{ userFind }],
      };

      return NextResponse.json(successResponse);
    }

    // create new user

    const user = new User({
      username: body.username,
      email: body.email,
      password: body.password,
      otp,
      otp_expiry: otpExpiryTime,
    });

    await user.save();
    //TODO: send otp to user

    const successResponse: ResponseType = {
      message: "User created successfully",
      success: true,
      statusCode: 200,
      messages: [{ user }],
    };
    return NextResponse.json(successResponse);
  } catch (err) {
    const errorResponse: ResponseType = {
      message: "Internal server error",
      success: false,
      statusCode: 500,
      messages: [{ err }],
    };

    return NextResponse.json(errorResponse);
  }
}

// Generate OTP Function

const generateOTP = () => {
  const digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < 6; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
};

// Generate OTP Expiry Time

const generateOTPExpiryTime = () => {
  const currentTime = new Date();
  const expiryTime = new Date(currentTime.getTime() + 60 * 60 * 1000);
  return expiryTime;
};
