"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";

const ForgotPasswordPage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: { email: string }) => {};

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-60px)] bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow dark:bg-gray-800">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Forgot Password
          </h2>
          <p className="mb-4">
            Enter your email address and we will send you a link to reset your
            password.
          </p>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full sm:w-2/3 mx-auto space-y-8"
          >
            <FormField
              name="email"
              render={({ field }) => (
                <FormItem className="flex justify-center">
                  <FormLabel className="sr-only">Email Address</FormLabel>
                  <FormControl className="w-full max-w-[300px]">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-center">
              <Button
                className="w-full max-w-[300px]"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
