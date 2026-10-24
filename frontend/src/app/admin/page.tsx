"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Lock,
  User,
  KeyRound,
  Eye,
  EyeOff,
  LogOut,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdmin, type AdminAppReview } from "@/hooks/use-admin";
import { StarRatingDisplay } from "@/components/reviews/star-rating-input";

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminPage() {
  const {
    isAuthenticated,
    isInitializing,
    isLoadingReviews,
    reviewsData,
    actionError,
    login,
    logout,
    fetchReviews,
    approveReview,
    rejectReview,
    deleteReview,
  } = useAdmin();

  // Login form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Tab & action state
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "all">("pending");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);
    try {
      await login(username, password);
      setUsername("");
      setPassword("");
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Invalid credentials");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      await approveReview(id);
      setFeedbackMessage("Review approved & published live!");
      setTimeout(() => setFeedbackMessage(null), 3000);
    } catch {
      // handled by hook
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    try {
      await rejectReview(id);
      setFeedbackMessage("Review moved back to moderation.");
      setTimeout(() => setFeedbackMessage(null), 3000);
    } catch {
      // handled by hook
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this review?")) return;
    setProcessingId(id);
    try {
      await deleteReview(id);
      setFeedbackMessage("Review permanently deleted.");
      setTimeout(() => setFeedbackMessage(null), 3000);
    } catch {
      // handled by hook
    } finally {
      setProcessingId(null);
    }
  };

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf5f6]">
        <div className="size-8 animate-spin rounded-full border-4 border-[#f0dfe3] border-t-[#7a1f39]" />
      </div>
    );
  }

  // ─── LOGIN SCREEN (Shown if not authenticated) ─────────────
  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#2d111b] via-[#4a1c2b] to-[#1a0810] p-4 sm:p-6">
        <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/10">
          {/* Header */}
          <div className="bg-[#fbeaf0] p-8 text-center border-b border-[#f0dfe3]">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#7a1f39] text-white shadow-md mb-3">
              <ShieldCheck className="size-7" />
            </div>
            <h1 className="text-xl font-black text-[#2d111b] tracking-tight">
              Modhuralap Administration
            </h1>
            <p className="mt-1 text-xs text-[#6a4953]">
              Restricted portal. Authorized team credentials required.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="p-8 space-y-5">
            {loginError && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-xs font-semibold text-red-700 animate-in fade-in duration-200">
                <AlertTriangle className="size-4 shrink-0 text-red-600" />
                {loginError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#2d111b] mb-1.5">
                Admin Username
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#6a4953]" />
                <Input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="h-11 rounded-xl pl-10 border-[#f0dfe3] text-sm text-[#2d111b] focus:border-[#7a1f39] focus:ring-[#7a1f39]/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2d111b] mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#6a4953]" />
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="h-11 rounded-xl pl-10 pr-10 border-[#f0dfe3] text-sm text-[#2d111b] focus:border-[#7a1f39] focus:ring-[#7a1f39]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6a4953] hover:text-[#2d111b] cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoggingIn || !username || !password}
              className="h-11 w-full rounded-xl bg-[#7a1f39] text-white hover:bg-[#661b2f] font-bold text-sm shadow-md transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {isLoggingIn ? (
                <div className="flex items-center gap-2">
                  <div className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Verifying...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  Sign In to Backoffice
                  <ArrowRight className="size-4" />
                </div>
              )}
            </Button>

            <p className="text-[11px] text-center text-[#6a4953]/70 pt-2">
              Modhuralap Security Gateway • 256-bit encrypted session
            </p>
          </form>
        </div>
      </main>
    );
  }

  // ─── ADMIN DASHBOARD SCREEN (Shown once logged in) ─────────
  const pendingReviews = reviewsData?.pending ?? [];
  const approvedReviews = reviewsData?.approved ?? [];
  const allReviews = reviewsData?.all ?? [];
  const stats = reviewsData?.stats;

  const currentList =
    activeTab === "pending"
      ? pendingReviews
      : activeTab === "approved"
        ? approvedReviews
        : allReviews;

  return (
    <div className="min-h-screen bg-[#faf5f6] text-[#2d111b]">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-[#f0dfe3] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#7a1f39] text-white shadow-xs">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[#2d111b] tracking-tight">Modhuralap</span>
                <span className="rounded-md bg-[#fbeaf0] px-2 py-0.5 text-[10px] font-bold text-[#7a1f39]">
                  Admin Console
                </span>
              </div>
              <p className="text-[10px] text-[#6a4953]">Platform Content & Review Moderation</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchReviews}
              disabled={isLoadingReviews}
              className="h-9 rounded-xl border-[#f0dfe3] text-[#6a4953] hover:bg-[#fdfafb] text-xs font-semibold cursor-pointer"
            >
              <RefreshCw className={cn("size-3.5 mr-1.5", isLoadingReviews && "animate-spin")} />
              Refresh
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="h-9 rounded-xl text-red-600 hover:bg-red-50 text-xs font-semibold cursor-pointer"
            >
              <LogOut className="size-3.5 mr-1.5" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Toast / Feedback Banner */}
        {feedbackMessage && (
          <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-800 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
            <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
            {feedbackMessage}
          </div>
        )}

        {actionError && (
          <div className="flex items-center gap-2 rounded-2xl bg-red-50 border border-red-200 p-4 text-xs font-bold text-red-800 shadow-sm">
            <XCircle className="size-4 text-red-600 shrink-0" />
            {actionError}
          </div>
        )}

        {/* ─── Metric Cards ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-[#f0dfe3] bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6a4953]">Total Reviews</span>
              <Sparkles className="size-4 text-[#7a1f39]" />
            </div>
            <p className="mt-2 text-2xl sm:text-3xl font-black text-[#2d111b]">{stats?.total ?? 0}</p>
            <p className="mt-1 text-[11px] text-[#6a4953]">All-time user submissions</p>
          </div>

          <div
            className={cn(
              "rounded-2xl border p-5 shadow-xs transition-colors",
              (stats?.pendingCount ?? 0) > 0
                ? "border-amber-200 bg-amber-50/60"
                : "border-[#f0dfe3] bg-white"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-800">Pending Moderation</span>
              <Clock className="size-4 text-amber-600" />
            </div>
            <p className="mt-2 text-2xl sm:text-3xl font-black text-amber-900">{stats?.pendingCount ?? 0}</p>
            <p className="mt-1 text-[11px] text-amber-700">Requires team review</p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-800">Live on Site</span>
              <CheckCircle2 className="size-4 text-emerald-600" />
            </div>
            <p className="mt-2 text-2xl sm:text-3xl font-black text-emerald-900">{stats?.approvedCount ?? 0}</p>
            <p className="mt-1 text-[11px] text-emerald-700">Published to /reviews</p>
          </div>

          <div className="rounded-2xl border border-[#f0dfe3] bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6a4953]">Average Rating</span>
              <span className="text-amber-500 font-bold text-xs">★</span>
            </div>
            <p className="mt-2 text-2xl sm:text-3xl font-black text-[#2d111b]">
              {stats?.averageRating ? `${stats.averageRating} ★` : "5.0 ★"}
            </p>
            <p className="mt-1 text-[11px] text-[#6a4953]">Platform satisfaction</p>
          </div>
        </div>

        {/* ─── Tabs & Filters ─── */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#f0dfe3] pb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("pending")}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer",
                activeTab === "pending"
                  ? "bg-[#7a1f39] text-white shadow-xs"
                  : "bg-white text-[#6a4953] border border-[#f0dfe3] hover:bg-[#fdfafb]"
              )}
            >
              <Clock className="size-3.5" />
              Pending Moderation
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px]",
                  activeTab === "pending"
                    ? "bg-white/20 text-white"
                    : "bg-amber-100 text-amber-800"
                )}
              >
                {pendingReviews.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("approved")}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer",
                activeTab === "approved"
                  ? "bg-[#7a1f39] text-white shadow-xs"
                  : "bg-white text-[#6a4953] border border-[#f0dfe3] hover:bg-[#fdfafb]"
              )}
            >
              <CheckCircle2 className="size-3.5" />
              Live on Site
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px]",
                  activeTab === "approved"
                    ? "bg-white/20 text-white"
                    : "bg-emerald-100 text-emerald-800"
                )}
              >
                {approvedReviews.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer",
                activeTab === "all"
                  ? "bg-[#7a1f39] text-white shadow-xs"
                  : "bg-white text-[#6a4953] border border-[#f0dfe3] hover:bg-[#fdfafb]"
              )}
            >
              All Submissions
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px]",
                  activeTab === "all"
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-[#6a4953]"
                )}
              >
                {allReviews.length}
              </span>
            </button>
          </div>
        </div>

        {/* ─── Reviews List ─── */}
        {isLoadingReviews ? (
          <div className="flex justify-center py-20">
            <div className="size-8 animate-spin rounded-full border-4 border-[#f0dfe3] border-t-[#7a1f39]" />
          </div>
        ) : currentList.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#f0dfe3] bg-white p-12 text-center">
            <div className="mx-auto size-12 rounded-full bg-[#fbeaf0] flex items-center justify-center text-[#7a1f39] mb-3">
              <CheckCircle2 className="size-6" />
            </div>
            <h3 className="text-base font-bold text-[#2d111b]">
              {activeTab === "pending"
                ? "No reviews waiting for moderation"
                : activeTab === "approved"
                  ? "No live reviews yet"
                  : "No reviews submitted yet"}
            </h3>
            <p className="mt-1 text-xs text-[#6a4953]">
              {activeTab === "pending"
                ? "All user-submitted testimonials have been moderated. Check back later!"
                : "Approved reviews will appear here and on the public /reviews page."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentList.map((rev) => (
              <AdminReviewCard
                key={rev.id}
                review={rev}
                isProcessing={processingId === rev.id}
                onApprove={() => handleApprove(rev.id)}
                onReject={() => handleReject(rev.id)}
                onDelete={() => handleDelete(rev.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function AdminReviewCard({
  review,
  isProcessing,
  onApprove,
  onReject,
  onDelete,
}: {
  review: AdminAppReview;
  isProcessing: boolean;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className={cn(
        "rounded-2xl border bg-white p-5 sm:p-6 shadow-xs transition-all",
        !review.isApproved
          ? "border-amber-200 ring-1 ring-amber-100"
          : "border-[#f0dfe3]"
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        {/* Left: Reviewer & Comment */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="size-11 rounded-full bg-gradient-to-br from-[#d4a2ab] to-[#7a1f39] flex items-center justify-center text-white text-sm font-bold shrink-0 overflow-hidden shadow-xs">
            {review.user.avatar && !imgError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={review.user.avatar}
                alt={review.user.fullName}
                className="size-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              review.user.fullName
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-[#2d111b]">{review.user.fullName}</h4>
              {review.user.city && (
                <span className="text-xs text-[#6a4953]">• {review.user.city}</span>
              )}
              <span className="text-[11px] text-[#6a4953]">
                • {formatRelativeDate(review.createdAt)}
              </span>

              {review.isApproved ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700 ml-auto sm:ml-0">
                  <CheckCircle2 className="size-3" /> Live on Site
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-700 ml-auto sm:ml-0">
                  <Clock className="size-3" /> Under Moderation
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <StarRatingDisplay rating={review.rating} size="sm" />
              <span className="text-xs font-bold text-[#2d111b]">{review.rating}.0 / 5.0</span>
            </div>

            <p className="text-sm text-[#4a2b35] leading-relaxed italic bg-[#fdfafb] border border-[#f0dfe3] rounded-xl p-3.5">
              &ldquo;{review.comment}&rdquo;
            </p>
          </div>
        </div>

        {/* Right: Moderation Actions */}
        <div className="flex sm:flex-col items-center gap-2 shrink-0 pt-2 sm:pt-0 self-end sm:self-start">
          {!review.isApproved ? (
            <Button
              size="sm"
              onClick={onApprove}
              disabled={isProcessing}
              className="h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 shadow-xs cursor-pointer"
            >
              <CheckCircle2 className="size-3.5 mr-1" />
              Approve ✓
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={onReject}
              disabled={isProcessing}
              className="h-8 rounded-xl border-amber-300 text-amber-800 hover:bg-amber-50 font-bold text-xs px-3 cursor-pointer"
            >
              <Clock className="size-3.5 mr-1 text-amber-600" />
              Unpublish
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={onDelete}
            disabled={isProcessing}
            className="h-8 rounded-xl border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs px-3 cursor-pointer"
          >
            <Trash2 className="size-3.5 mr-1 text-red-500" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
