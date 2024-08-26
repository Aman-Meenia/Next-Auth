import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ResponseType } from "../Types/ResponseType";
import User from "@/models/userModel";
import { fromZodError } from "zod-validation-error";
import dbConnect from "@/db/dbConnect";

const userInputTypeValidation = z.object({
  email: z.string().email("Please enter a valid email address"),
  otp: z.string().length(6, "OTP must be 6 digits long"),
}).strict();

type userInputType = z.infer<typeof userInputTypeValidation>;

export async function POST(request: NextRequest) {
  try {
    dbConnect();

    const data: userInputType = await request.json();

    const zodResponse = userInputTypeValidation.safeParse(data);

    if (!zodResponse.success) {
      const errorResponse: ResponseType = {
        success: false,
        message: fromZodError(zodResponse.error).message,
        statusCode: 400,
      };
      return NextResponse.json(errorResponse);
    }

    const user = await User.findOne({ email: data.email });

    if (!user) {
      const errorResponse: ResponseType = {
        success: false,
        message: "User not found",
        statusCode: 404,
      };
      return NextResponse.json(errorResponse);
    }

    if (user.isVerified) {
      const errorResponse: ResponseType = {
        success: false,
        message: "User already verified",
        statusCode: 400,
      };
      return NextResponse.json(errorResponse);
    }

    if (user.otp !== data.otp) {
      const errorResponse: ResponseType = {
        success: false,
        message: "Invalid OTP",
        statusCode: 400,
      };
      return NextResponse.json(errorResponse);
    }

    user.isVerified = true;
    await user.save();

    const successResponse: ResponseType = {
      success: true,
      message: "User verified successfully",
      statusCode: 200,
    };

    return NextResponse.json(successResponse);
  } catch (err) {
    const errorResponse: ResponseType = {
      success: false,
      message: "Internal server error",
      statusCode: 500,
    };

    return NextResponse.json(errorResponse);
  }
}
