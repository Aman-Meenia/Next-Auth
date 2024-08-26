import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import User from "@/models/userModel";
import dbConnect from "@/db/dbConnect";
import { fromZodError } from "zod-validation-error";
import { ResponseType } from "../Types/ResponseType";

const userInputTypeValidation = z
  .object({
    email: z.string().email("Please enter a valid email address"),
  })
  .strict();

type userInputType = z.infer<typeof userInputTypeValidation>;

export async function GET(request: NextRequest) {
  try {
    dbConnect();

    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    if (!email) {
      const errorResponse: ResponseType = {
        success: false,
        message: "Email is required",
        statusCode: 400,
      };
      return NextResponse.json(errorResponse);
    }

    const body: userInputType = {
      email: email,
    };
    const zodResponse = userInputTypeValidation.safeParse(body);

    if (zodResponse.success === false) {
      const errorResponse: ResponseType = {
        success: false,
        message: fromZodError(zodResponse?.error).message,
        statusCode: 400,
      };
      return NextResponse.json(errorResponse);
    }

    const user = await User.findOne({ email: body.email });

    if (!user) {
      const errorResponse: ResponseType = {
        success: false,
        message: "User not found",
        statusCode: 404,
      };
      return NextResponse.json(errorResponse);
    }

    // if user is present but not verified

    if (user.isVerified === false) {
      const errorResponse: ResponseType = {
        success: false,
        message: "First verify your email",
        statusCode: 400,
      };
      return NextResponse.json(errorResponse);
    }

    //TODO: Send Forget password link to email

    const successResponse: ResponseType = {
      success: true,
      message: "Forgot password link sent to your email",
      statusCode: 200,
    };
    return NextResponse.json(successResponse);
  } catch (err) {
    const errorResponse: ResponseType = {
      success: false,
      message: "Internal server error",
      statusCode: 400,
    };
    return NextResponse.json(errorResponse);
  }
}
