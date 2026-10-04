"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Briefcase, Link as LinkIcon, Loader2, Plus, X } from "lucide-react";
import { useMyCoFounderProfile } from "@/hooks/use-cofounders";
import { workInterestOptions } from "@/config/cofounder-data";
import { useAuth } from "@/hooks/use-auth";
import { useChatAccess } from "@/hooks/use-chat-access";
import { useRouter, useSearchParams } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  linkedinUrl: z.string().url("Must be a valid URL").regex(/^https?:\/\/([a-z]{2,3}\.)?(www\.)?linkedin\.com\/.+/i, "Must be a valid LinkedIn profile URL"),
  workInterests: z.array(z.string()).min(1, "Select at least one work interest").max(5, "Maximum 5 interests allowed"),
  pitch: z.string().min(10, "Pitch must be at least 10 characters").max(500, "Maximum 500 characters"),
  lookingFor: z.string().max(500, "Maximum 500 characters").optional(),
});

type FormData = z.infer<typeof schema>;

export function CoFounderSettings() {
  const { user } = useAuth();
  const { profile, isLoading, save } = useMyCoFounderProfile();
  const { markProfileCreated } = useChatAccess();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    values: {
      linkedinUrl: profile?.linkedinUrl || user?.linkedinUrl || "",
      workInterests: profile?.workInterests || [],
      pitch: profile?.pitch || "",
      lookingFor: profile?.lookingFor || "",
    },
  });

  const { formState: { errors } } = form;
  const workInterests = form.watch("workInterests");

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setSuccess(false);
    setSubmitError(null);
    try {
      const isFirstTime = !profile;
      await save({ ...data, isActive: true });
      // Update global state instantly — no page refresh needed anywhere in the app
      markProfileCreated();
      setSuccess(true);
      const next = searchParams.get("next");
      if (isFirstTime && next && next.startsWith("/")) {
        setTimeout(() => router.push(next), 900);
      } else {
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleInterest = (interest: string) => {
    if (workInterests.includes(interest)) {
      form.setValue("workInterests", workInterests.filter((i) => i !== interest));
    } else if (workInterests.length < 5) {
      form.setValue("workInterests", [...workInterests, interest]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <main className="lg:col-span-6 space-y-6">
      <div className="flex items-center gap-3 rounded-2xl border border-soft-border bg-white p-4 shadow-xs sm:p-5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-berry/10 text-berry">
          <Briefcase className="size-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground sm:text-lg">
            Co-Founder Profile
          </h2>
          <p className="text-xs text-muted-foreground">
            Connect with other builders, founders, and partners.
          </p>
        </div>
      </div>

      <section className="rounded-2xl border border-soft-border bg-white p-4 shadow-xs sm:p-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <LinkIcon className="size-4 text-muted-foreground" />
              LinkedIn Profile URL <span className="text-destructive">*</span>
            </label>
            <p className="text-xs text-muted-foreground">
              This will be public so others can verify your professional background.
            </p>
            <Input
              {...form.register("linkedinUrl")}
              placeholder="https://www.linkedin.com/in/your-profile"
              className="h-11 border-soft-border bg-white text-sm placeholder:text-muted-foreground/60 focus-visible:border-berry focus-visible:ring-berry/20"
            />
            {errors.linkedinUrl && (
              <p className="text-xs text-destructive">{errors.linkedinUrl.message}</p>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-foreground">
              Work Interests <span className="text-destructive">*</span>
            </label>
            <p className="text-xs text-muted-foreground">Select up to 5 areas of interest.</p>
            <div className="flex flex-wrap gap-2">
              {workInterestOptions.map((interest) => {
                const isSelected = workInterests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={[
                      "inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                      isSelected
                        ? "border-berry bg-berry text-white shadow-sm"
                        : "border-soft-border bg-muted/50 text-muted-foreground hover:border-berry/50 hover:bg-berry/5"
                    ].join(" ")}
                  >
                    {isSelected ? (
                      <X className="mr-1 inline-block size-3" />
                    ) : (
                      <Plus className="mr-1 inline-block size-3" />
                    )}
                    {interest}
                  </button>
                );
              })}
            </div>
            {errors.workInterests && (
              <p className="text-xs text-destructive">{errors.workInterests.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              Your Pitch / Idea <span className="text-destructive">*</span>
            </label>
            <p className="text-xs text-muted-foreground">
              Briefly describe your idea or what you are working on.
            </p>
            <Textarea
              {...form.register("pitch")}
              placeholder="I'm building a SaaS for..."
              className="min-h-[120px] resize-none border-soft-border bg-white text-sm placeholder:text-muted-foreground/60 focus-visible:border-berry focus-visible:ring-berry/20"
            />
            {errors.pitch && (
              <p className="text-xs text-destructive">{errors.pitch.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              Looking For
            </label>
            <p className="text-xs text-muted-foreground">
              What kind of partner or skills are you seeking?
            </p>
            <Textarea
              {...form.register("lookingFor")}
              placeholder="Looking for a technical co-founder with experience in..."
              className="min-h-[90px] resize-none border-soft-border bg-white text-sm placeholder:text-muted-foreground/60 focus-visible:border-berry focus-visible:ring-berry/20"
            />
            {errors.lookingFor && (
              <p className="text-xs text-destructive">{errors.lookingFor.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-3 border-t border-soft-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {success && (
                <span className="font-medium text-green-600">
                  Profile saved successfully!{searchParams.get("next") ? " Taking you back…" : ""}
                </span>
              )}
              {submitError && <span className="font-medium text-destructive">{submitError}</span>}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 w-full rounded-xl bg-deep-plum text-white hover:bg-berry-dark sm:w-auto"
            >
              {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              {profile ? "Update Profile" : "Create Profile"}
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}
