"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  UserPlus,
} from "lucide-react";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { signupSchema, type SignupFormValues } from "@/schemas/auth";

/**
 * Signup form matching the Modhuralap reference design.
 *
 * Contains:
 *   - User icon at top
 *   - "Create Your Modhuralap Account" heading
 *   - Full Name, Email, Mobile, City (select), DOB
 *   - Create app password + Confirm App Password (side-by-side)
 *   - Terms & Conditions checkbox
 *   - Create Account button
 *   - Social login placeholders
 *   - "Already have an account? Login" link
 */
export function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      mobile: "",
      city: "",
      dob: "",
      password: "",
      confirmPassword: "",
      terms: false as unknown as true,
    },
  });

  async function onSubmit(data: SignupFormValues) {
    // TODO: Replace with real registration API call.
    console.warn("⚠️  DEV ONLY: Signup form submitted", data);
    await new Promise((r) => setTimeout(r, 1000));
    alert("Sign up submitted (no backend connected yet).");
  }

  const inputBase =
    "h-11 rounded-lg border-soft-border bg-white text-sm placeholder:text-muted-foreground/60 focus-visible:border-berry focus-visible:ring-berry/20";
  const inputError =
    "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20";

  return (
    <div className="w-full max-w-[460px]">
      {/* ─── User Icon ─── */}
      <div className="mb-5 flex justify-start">
        <div className="flex size-12 items-center justify-center rounded-full bg-berry/10 ring-1 ring-berry/20">
          <UserPlus className="size-5 text-berry" />
        </div>
      </div>

      {/* ─── Heading ─── */}
      <h1 className="text-2xl font-bold leading-tight text-foreground sm:text-[1.7rem]">
        Create Your
        <br />
        <span className="italic text-berry">Modhuralap Account</span>
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Join Modhuralap and start discovering meaningful connections, real
        experiences and a community built around trust.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 space-y-4"
        noValidate
      >
        {/* ─── Full Name ─── */}
        <div className="space-y-1.5">
          <Label htmlFor="fullName" className="text-sm font-medium">
            Full Name <span className="text-destructive" aria-hidden="true">*</span>
          </Label>
          <div className="relative">
            <User
              className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
              aria-hidden="true"
            />
            <Input
              id="fullName"
              type="text"
              placeholder="Enter your full name"
              autoComplete="name"
              disabled={isSubmitting}
              aria-invalid={!!errors.fullName}
              aria-describedby={errors.fullName ? "fullName-error" : undefined}
              className={cn(inputBase, "pl-10", errors.fullName && inputError)}
              {...register("fullName")}
            />
          </div>
          {errors.fullName && (
            <p id="fullName-error" className="text-xs text-destructive" role="alert">
              {errors.fullName.message}
            </p>
          )}
        </div>

        {/* ─── Email ─── */}
        <div className="space-y-1.5">
          <Label htmlFor="signup-email" className="text-sm font-medium">
            Email Address <span className="text-destructive" aria-hidden="true">*</span>
          </Label>
          <div className="relative">
            <Mail
              className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
              aria-hidden="true"
            />
            <Input
              id="signup-email"
              type="email"
              placeholder="Enter your email address"
              autoComplete="email"
              disabled={isSubmitting}
              aria-invalid={!!errors.email}
              className={cn(inputBase, "pl-10", errors.email && inputError)}
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-destructive" role="alert">{errors.email.message}</p>
          )}
        </div>

        {/* ─── Mobile Number ─── */}
        <div className="space-y-1.5">
          <Label htmlFor="mobile" className="text-sm font-medium">
            Mobile Number <span className="text-destructive" aria-hidden="true">*</span>
          </Label>
          <div className="relative">
            <Phone
              className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
              aria-hidden="true"
            />
            <Input
              id="mobile"
              type="tel"
              placeholder="Enter your mobile number"
              autoComplete="tel"
              disabled={isSubmitting}
              aria-invalid={!!errors.mobile}
              className={cn(inputBase, "pl-10", errors.mobile && inputError)}
              {...register("mobile")}
            />
          </div>
          {errors.mobile && (
            <p className="text-xs text-destructive" role="alert">{errors.mobile.message}</p>
          )}
        </div>

        {/*
         * ─── City field temporarily disabled ───
         * Re-enable later by restoring the city block and schema field.
         */}

        {/* ─── Date of Birth ─── */}
        <div className="space-y-1.5">
          <Label htmlFor="dob" className="text-sm font-medium">
            Date of Birth <span className="text-destructive" aria-hidden="true">*</span>
          </Label>
          <div className="relative">
            <Calendar
              className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
              aria-hidden="true"
            />
            <Input
              id="dob"
              type="text"
              placeholder="DD / MM / YYYY"
              autoComplete="bday"
              disabled={isSubmitting}
              aria-invalid={!!errors.dob}
              className={cn(inputBase, "pl-10", errors.dob && inputError)}
              {...register("dob")}
            />
          </div>
          {errors.dob && (
            <p className="text-xs text-destructive" role="alert">{errors.dob.message}</p>
          )}
        </div>

        {/* ─── App Password + Confirm (side-by-side) ─── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="signup-password" className="text-sm font-medium">
              Create app password <span className="text-destructive" aria-hidden="true">*</span>
            </Label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
                aria-hidden="true"
              />
              <Input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                placeholder="Create app password"
                autoComplete="new-password"
                disabled={isSubmitting}
                aria-invalid={!!errors.password}
                className={cn(inputBase, "pl-10 pr-10", errors.password && inputError)}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive" role="alert">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm App Password <span className="text-destructive" aria-hidden="true">*</span>
            </Label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
                aria-hidden="true"
              />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm app password"
                autoComplete="new-password"
                disabled={isSubmitting}
                aria-invalid={!!errors.confirmPassword}
                className={cn(inputBase, "pl-10 pr-10", errors.confirmPassword && inputError)}
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded text-muted-foreground hover:text-foreground"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-destructive" role="alert">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        {/* ─── Terms & Conditions ─── */}
        <div className="space-y-1.5">
          <Controller
            control={control}
            name="terms"
            render={({ field }) => (
              <div className="flex items-start gap-2.5">
                <Checkbox
                  id="terms"
                  checked={field.value === true}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                  aria-invalid={!!errors.terms}
                  className="mt-0.5 border-berry data-checked:bg-berry data-checked:border-berry"
                />
                <Label htmlFor="terms" className="text-sm leading-snug text-muted-foreground font-normal">
                  I agree to the{" "}
                  <Link href="/terms" className="font-medium text-foreground underline hover:text-berry">
                    Terms & Conditions
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="font-medium text-foreground underline hover:text-berry">
                    Privacy Policy
                  </Link>
                </Label>
              </div>
            )}
          />
          {errors.terms && (
            <p className="text-xs text-destructive" role="alert">{errors.terms.message}</p>
          )}
        </div>

        {/* ─── Create Account Button ─── */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "h-12 w-full rounded-xl text-base font-semibold",
            "bg-deep-plum hover:bg-berry-dark text-white",
            "transition-all duration-200",
            "focus-visible:ring-berry/50 focus-visible:ring-offset-2"
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 size-5 animate-spin" />
              Creating account…
            </>
          ) : (
            <>
              Create Account
              <ArrowRight className="ml-2 size-5" data-icon="inline-end" />
            </>
          )}
        </Button>
      </form>

      {/* ─── Divider ─── */}
      <div className="relative my-5 flex items-center">
        <Separator className="flex-1 bg-soft-border" />
        <span className="mx-4 text-xs text-muted-foreground uppercase tracking-wider select-none">or</span>
        <Separator className="flex-1 bg-soft-border" />
      </div>

      {/* ─── Social Sign Up Buttons ─── */}
      <div className="space-y-2.5">
        <Button
          type="button"
          variant="outline"
          disabled
          className="h-11 w-full rounded-xl border-soft-border bg-white text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          <svg className="mr-3 size-5" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </Button>

        <Button
          type="button"
          variant="outline"
          disabled
          className="h-11 w-full rounded-xl border-soft-border bg-white text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          <svg className="mr-3 size-5" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="1" y="1" width="10" height="10" fill="#F25022" />
            <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
            <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
            <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
          </svg>
          Continue with Microsoft
        </Button>
      </div>

      {/* ─── Login Prompt ─── */}
      <p className="mt-5 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-foreground transition-colors hover:text-berry rounded">
          Login
        </Link>
      </p>
    </div>
  );
}
