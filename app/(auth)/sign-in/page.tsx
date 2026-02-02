"use client";

import InputField from "@/components/forms/InputField";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useForm } from "react-hook-form";

const SignIn = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  const onSubmit = async (data: SignInFormData) => {
    try {
      console.log("Sign-in data:", data);
    } catch (error) {
      console.error("Sign-in error:", error);
    }
  };

  return (
    <>
      <h2 className="form-title">Login In Your Account</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <InputField
          name="email"
          label="Email"
          placeholder="john.doe@example.com"
          register={register}
          error={errors.email}
          validation={{
            required: "Email is required",
            pattern: /^\S+@\S+$/,
            message: "Invalid email address",
          }}
        />
        <InputField
          name="password"
          label="Password"
          placeholder="Enter your password"
          type="password"
          register={register}
          error={errors.password}
          validation={{ required: "Password is required", minLength: 8 }}
        />
        <Button type="submit" className="yellow-btn w-full mt-5" disabled={isSubmitting}>
          {isSubmitting ? "Logging in" : "Login"}
        </Button>
        <p className="text-sm text-gray-400 text-center">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="footer-link">
            Create an account
          </Link>
        </p>
      </form>
    </>
  );
};

export default SignIn;
