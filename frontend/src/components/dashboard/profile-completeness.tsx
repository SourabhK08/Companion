"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, CheckCircle2, Circle } from "lucide-react";

export function ProfileCompleteness() {
  const { user } = useAuth();

  if (!user) return null;

  const fields = [
    { name: "Avatar", isComplete: !!user.avatarUrl },
    { name: "Date of Birth", isComplete: !!user.dateOfBirth },
    { name: "City", isComplete: !!user.city },
    { name: "Bio", isComplete: !!user.bio },
    { name: "Interests", isComplete: user.interests && user.interests.length > 0 },
    { name: "Languages", isComplete: user.languages && user.languages.length > 0 },
  ];

  const completedCount = fields.filter((f) => f.isComplete).length;
  const percentage = Math.round((completedCount / fields.length) * 100);

  if (percentage === 100) return null; // Don't show if 100% complete

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-[#efdfe3] bg-gradient-to-r from-[#fdfafb] to-[#f4dbe2] shadow-sm">
      <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        
        <div className="flex-1 w-full">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-[#2d111b]">Complete Your Profile</h3>
            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-[#7a1f39] ring-1 ring-[#f0dfe3]">
              {percentage}%
            </span>
          </div>
          <p className="mt-1 text-sm text-[#6a4953]">
            A complete profile helps you find better matches and ensures trust in our community.
          </p>

          <div className="mt-4 flex w-full items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white ring-1 ring-[#efdfe3]">
              <div 
                className="h-full bg-[#7a1f39] transition-all duration-500 ease-in-out" 
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
          
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-[#6a4953]">
            {fields.map((field) => (
              <span key={field.name} className="flex items-center gap-1.5">
                {field.isComplete ? (
                  <CheckCircle2 className="size-3.5 text-emerald-600" />
                ) : (
                  <Circle className="size-3.5 text-[#d5c0c6]" />
                )}
                <span className={field.isComplete ? "text-emerald-700" : ""}>
                  {field.name}
                </span>
              </span>
            ))}
          </div>
        </div>

        <Link 
          href="/settings"
          className="shrink-0 flex items-center justify-center gap-2 rounded-full bg-[#7a1f39] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#661b2f] w-full sm:w-auto"
        >
          Complete Now
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
