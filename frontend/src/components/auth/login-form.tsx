"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { loginSchema, type LoginFormValues } from "@/schemas/auth";
import { useAuth } from "@/hooks/use-auth";

/**
 * Login form card matching the reference design.
 *
 * Contains:
 *   - Login / Sign Up tab treatment (Sign Up is placeholder)
 *   - "Welcome Back!" heading + description
 *   - Email/Mobile input with mail icon
 *   - Password input with lock icon + show/hide toggle
 *   - Forgot Password link (placeholder)
 *   - Login button with loading state
 *   - "or" divider
 *   - Continue with Google / Microsoft buttons (placeholder)
 *   - Sign up prompt
 *
 * Form handling: React Hook Form + Zod
 * Auth: calls useAuth().login() — decoupled from implementation
 */
export function LoginForm() {
  const router = useRouter();
  const { login, isLoading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const isDisabled = isSubmitting || authLoading;

  async function onSubmit(data: LoginFormValues) {
    setServerError(null);
    const result = await login({
      email: data.email,
      password: data.password,
    });

    if (!result.success) {
      setServerError(result.error ?? "Login failed. Please try again.");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="w-full max-w-[440px]">
      {/* ─── Tab Treatment ─── */}
      <div className="flex border-b border-soft-border">
        <span
          className="flex-1 pb-3 text-center text-lg font-semibold text-foreground border-b-2 border-berry"
          aria-current="page"
        >
          Login
        </span>
        <Link
          href="/signup"
          className="flex-1 pb-3 text-center text-lg font-medium text-muted-foreground transition-colors hover:text-foreground border-b-2 border-transparent"
        >
          Sign Up
        </Link>
      </div>

      {/* ─── Form Content ─── */}
      <div className="pt-8">
        <h1 className="text-2xl font-bold text-foreground">Welcome Back!</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Log in to your Modhuralap account to continue.
        </p>

        {/* Server error */}
        {serverError && (
          <div
            className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            role="alert"
          >
            {serverError}
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-6 space-y-5"
          noValidate
        >
          {/* ─── Email Field ─── */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-foreground">
              Email Address {" "}
              <span className="text-destructive" aria-hidden="true">*</span>
            </Label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
                aria-hidden="true"
              />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                autoComplete="email"
                disabled={isDisabled}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                className={cn(
                  "h-11 pl-10 pr-4 rounded-lg border-soft-border bg-white text-sm",
                  "placeholder:text-muted-foreground/60",
                  "focus-visible:border-berry focus-visible:ring-berry/20",
                  errors.email && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20"
                )}
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p id="email-error" className="text-xs text-destructive" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* ─── Password Field ─── */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-foreground">
              Password <span className="text-destructive" aria-hidden="true">*</span>
            </Label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
                aria-hidden="true"
              />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={isDisabled}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
                className={cn(
                  "h-11 pl-10 pr-12 rounded-lg border-soft-border bg-white text-sm",
                  "placeholder:text-muted-foreground/60",
                  "focus-visible:border-berry focus-visible:ring-berry/20",
                  errors.password && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20"
                )}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className={cn(
                  "absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded",
                  "text-muted-foreground transition-colors hover:text-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-berry/50"
                )}
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={0}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="text-xs text-destructive" role="alert">
                {errors.password.message}
              </p>
            )}

            {/* Forgot Password */}
            <div className="flex justify-end">
              <button
                type="button"
                className="text-xs font-medium text-berry transition-colors hover:text-berry-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-berry/50 rounded"
                disabled
                aria-label="Forgot Password (coming soon)"
              >
                Forgot Password?
              </button>
            </div>
          </div>

          {/* ─── Login Button ─── */}
          <Button
            type="submit"
            disabled={isDisabled}
            className={cn(
              "h-12 w-full rounded-xl text-base font-semibold",
              "bg-deep-plum hover:bg-berry-dark text-white",
              "transition-all duration-200",
              "focus-visible:ring-berry/50 focus-visible:ring-offset-2"
            )}
          >
            {isSubmitting || authLoading ? (
              <>
                <Loader2 className="mr-2 size-5 animate-spin" />
                Logging in…
              </>
            ) : (
              <>
                Login
                <ArrowRight className="ml-2 size-5" data-icon="inline-end" />
              </>
            )}
          </Button>
        </form>

        {/* ─── Divider ─── */}
        <div className="relative my-6 flex items-center">
          <Separator className="flex-1 bg-soft-border" />
          <span className="mx-4 text-sm text-muted-foreground select-none">or</span>
          <Separator className="flex-1 bg-soft-border" />
        </div>

        {/* ─── Social Login Buttons (placeholders) ─── */}
        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            disabled
            className="h-12 w-full rounded-xl border-soft-border bg-white text-sm font-medium text-foreground hover:bg-muted transition-colors"
            aria-label="Continue with Google (coming soon)"
          >
            {/* Google icon placeholder — replace with /public/assets/google.svg */}
            <svg className="mr-3 size-5" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled
            className="h-12 w-full rounded-xl border-soft-border bg-white text-sm font-medium text-foreground hover:bg-muted transition-colors"
            aria-label="Continue with Microsoft (coming soon)"
          >
            {/* Microsoft icon placeholder — replace with /public/assets/microsoft.svg */}
            <svg className="mr-3 size-5" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="1" y="1" width="10" height="10" fill="#F25022" />
              <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
              <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
              <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
            </svg>
            Continue with Microsoft
          </Button>
        </div>

        {/* ─── Sign Up Prompt ─── */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-foreground transition-colors hover:text-berry focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-berry/50 rounded"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
