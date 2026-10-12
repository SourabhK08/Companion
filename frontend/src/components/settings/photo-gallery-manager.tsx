"use client";

import { useEffect, useRef, useState } from "react";
import {
  Camera,
  Trash2,
  Upload,
  Plus,
  Loader2,
  AlertCircle,
  Sparkles,
  User,
  Star,
  Info,
  Eye,
} from "lucide-react";
import { cn } from "cn";
import { useAuth } from "@/hooks/use-auth";
import {
  useProfilePhoto,
  MAX_TOTAL_PHOTOS,
  MAX_GALLERY_PHOTOS,
  type ProfilePhotoItem,
} from "@/hooks/use-profile-photo";
import { Button } from "@/components/ui/button";
import { ImageCarouselModal } from "@/components/shared/image-carousel-modal";

interface PhotoGalleryManagerProps {
  onAvatarUpdated?: (newUrl: string | null) => void;
}

export function PhotoGalleryManager({ onAvatarUpdated }: PhotoGalleryManagerProps) {
  const { user } = useAuth();
  const {
    photos,
    avatarPhoto,
    galleryPhotos,
    uploadPhoto,
    deletePhoto,
    setAsAvatar,
    removeAvatar,
    fetchPhotos,
    isUploading,
    uploadProgress,
    error: hookError,
    isLoadingPhotos,
  } = useProfilePhoto();

  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [targetSlot, setTargetSlot] = useState<"avatar" | "gallery">("avatar");
  const [carouselOpen, setCarouselOpen] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Fetch photos on component mount
  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setLocalError(null);

    try {
      const uploaded = await uploadPhoto(file, { setAsAvatar: true });
      if (uploaded?.imageUrl) {
        onAvatarUpdated?.(uploaded.imageUrl);
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Failed to upload avatar");
    }
  };

  const handleGalleryFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setLocalError(null);

    if (photos.length >= MAX_TOTAL_PHOTOS) {
      setLocalError(`Limit reached: maximum ${MAX_TOTAL_PHOTOS} photos allowed.`);
      return;
    }

    try {
      await uploadPhoto(file, { setAsAvatar: false });
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Failed to upload gallery image");
    }
  };

  const handleRemoveAvatar = async () => {
    if (isUploading || activeActionId) return;
    setActiveActionId("remove-avatar");
    setLocalError(null);

    try {
      await removeAvatar();
      onAvatarUpdated?.(null);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Failed to remove avatar");
    } finally {
      setActiveActionId(null);
    }
  };

  const handleSetAsAvatar = async (photo: ProfilePhotoItem) => {
    if (isUploading || activeActionId) return;
    setActiveActionId(photo.id);
    setLocalError(null);

    try {
      await setAsAvatar(photo.id);
      if (photo.imageUrl) {
        onAvatarUpdated?.(photo.imageUrl);
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Failed to set avatar");
    } finally {
      setActiveActionId(null);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (isUploading || activeActionId) return;
    setActiveActionId(photoId);
    setLocalError(null);

    try {
      await deletePhoto(photoId);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Failed to delete photo");
    } finally {
      setActiveActionId(null);
    }
  };

  const displayAvatarUrl = user?.avatarUrl || avatarPhoto?.imageUrl || null;
  const currentTotal = photos.length;
  const emptyGallerySlots = Math.max(0, MAX_GALLERY_PHOTOS - galleryPhotos.length);

  return (
    <section className="rounded-2xl border border-soft-border bg-white p-5 sm:p-6 shadow-xs space-y-6">
      {/* ─── Header & Limits ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-soft-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-berry/10 text-berry">
              <Camera className="size-4.5" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-foreground">
              Profile Photo &amp; Gallery
            </h3>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Manage your avatar and up to 4 gallery photos shown on your dashboard and public profile.
          </p>
        </div>

        {/* Counter Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border",
              currentTotal >= MAX_TOTAL_PHOTOS
                ? "bg-amber-50 text-amber-800 border-amber-200"
                : "bg-[#faecef]/60 text-berry border-berry/20"
            )}
          >
            <Sparkles className="size-3 text-berry" />
            {currentTotal}/{MAX_TOTAL_PHOTOS} Photos Used
          </span>
        </div>
      </div>

      {/* ─── Error Notification ─── */}
      {(localError || hookError) && (
        <div className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 p-3.5 text-xs sm:text-sm text-destructive">
          <AlertCircle className="size-4.5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">{localError || hookError}</p>
          </div>
          <button
            type="button"
            onClick={() => setLocalError(null)}
            className="text-xs font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ─── 1. Avatar Management ─── */}
      <div className="rounded-xl border border-soft-border/80 bg-[#fdfafb] p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Avatar Preview */}
            <div
              onClick={() => {
                if (displayAvatarUrl) {
                  setCarouselIndex(0);
                  setCarouselOpen(true);
                }
              }}
              className={cn(
                "relative size-20 sm:size-24 shrink-0",
                displayAvatarUrl ? "cursor-pointer group" : ""
              )}
            >
              <div className="size-full overflow-hidden rounded-full border-3 border-white shadow-md bg-gradient-to-br from-dusty-rose to-berry flex items-center justify-center text-white text-xl sm:text-2xl font-bold select-none relative">
                {displayAvatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={displayAvatarUrl}
                    alt={user?.name || "Avatar"}
                    className="size-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <span>{initials}</span>
                )}

                {/* Hover preview hint */}
                {displayAvatarUrl && (
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Eye className="size-5" />
                  </div>
                )}

                {/* Upload spinner */}
                {isUploading && targetSlot === "avatar" && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex flex-col items-center justify-center text-white z-10">
                    <Loader2 className="size-5 animate-spin mb-1" />
                    <span className="text-[11px] font-semibold">{uploadProgress}%</span>
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-berry px-2 py-0.5 text-[10px] font-bold text-white shadow-xs whitespace-nowrap">
                Avatar
              </span>
            </div>

            {/* Info text */}
            <div>
              <h4 className="text-sm sm:text-base font-bold text-foreground">
                Main Profile Picture
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {displayAvatarUrl
                  ? "This is your active profile picture visible everywhere."
                  : "No custom picture uploaded. Default monogram avatar is active."}
              </p>
              <div className="mt-1 text-[11px] text-muted-foreground/80">
                JPG, PNG, WebP or GIF up to 10MB
              </div>
            </div>
          </div>

          {/* Avatar Actions */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUploading}
              onClick={() => {
                setTargetSlot("avatar");
                avatarInputRef.current?.click();
              }}
              className="rounded-xl border-soft-border text-xs sm:text-sm font-semibold hover:border-berry hover:text-berry gap-1.5"
            >
              <Upload className="size-3.5 text-berry" />
              {displayAvatarUrl ? "Change Photo" : "Upload Photo"}
            </Button>

            {displayAvatarUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isUploading || activeActionId === "remove-avatar"}
                onClick={handleRemoveAvatar}
                className="rounded-xl text-xs sm:text-sm font-medium text-destructive hover:bg-destructive/10 gap-1.5"
              >
                {activeActionId === "remove-avatar" ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Trash2 className="size-3.5" />
                )}
                Remove (Default)
              </Button>
            )}
          </div>
        </div>

        {/* Hidden Input for Avatar */}
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleAvatarFileChange}
          className="hidden"
          disabled={isUploading}
        />
      </div>

      {/* ─── 2. Photo Gallery (Up to 4 images) ─── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-1.5">
              <span>Gallery Showcase</span>
              <span className="text-xs font-normal text-muted-foreground">
                ({galleryPhotos.length}/{MAX_GALLERY_PHOTOS} images)
              </span>
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Showcase additional moments and lifestyle photos on your public profile.
            </p>
          </div>

          {currentTotal < MAX_TOTAL_PHOTOS && galleryPhotos.length < MAX_GALLERY_PHOTOS && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUploading}
              onClick={() => {
                setTargetSlot("gallery");
                galleryInputRef.current?.click();
              }}
              className="rounded-xl border-soft-border text-xs font-semibold hover:border-berry hover:text-berry gap-1 hidden sm:inline-flex"
            >
              <Plus className="size-3.5 text-berry" />
              Add Photo
            </Button>
          )}
        </div>

        {/* Gallery Grid: 2 columns on mobile, 4 columns on tablets/desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {/* Uploaded Gallery Photos */}
          {galleryPhotos.map((photo, idx) => {
            const isActing = activeActionId === photo.id;
            return (
              <div
                key={photo.id}
                className="group relative aspect-square overflow-hidden rounded-2xl border border-soft-border bg-[#f8f3f4] shadow-2xs"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.imageUrl || photo.thumbnailUrl || ""}
                  alt={`Gallery photo ${idx + 1}`}
                  onClick={() => {
                    setCarouselIndex(idx);
                    setCarouselOpen(true);
                  }}
                  className="size-full object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
                />

                {/* Slot index label */}
                <div className="absolute top-2 left-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-xs">
                  #{idx + 1}
                </div>

                {/* Quick preview button in top right */}
                <button
                  type="button"
                  onClick={() => {
                    setCarouselIndex(idx);
                    setCarouselOpen(true);
                  }}
                  title="View full size"
                  className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-black/50 hover:bg-black/75 text-white backdrop-blur-xs transition-opacity sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer"
                >
                  <Eye className="size-3.5" />
                </button>

                {/* Action Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 sm:p-2.5 pointer-events-none">
                  <div className="flex items-center justify-between gap-1 w-full pointer-events-auto">
                    <button
                      type="button"
                      disabled={isUploading || isActing}
                      onClick={() => handleSetAsAvatar(photo)}
                      title="Set as profile avatar"
                      className="flex items-center gap-1 rounded-lg bg-white/90 hover:bg-white px-2 py-1 text-[11px] font-semibold text-deep-plum shadow-xs transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {isActing ? (
                        <Loader2 className="size-3 animate-spin text-berry" />
                      ) : (
                        <Star className="size-3 text-berry fill-berry" />
                      )}
                      <span className="hidden xs:inline">Make Avatar</span>
                    </button>

                    <button
                      type="button"
                      disabled={isUploading || isActing}
                      onClick={() => handleDeletePhoto(photo.id)}
                      title="Delete photo"
                      className="flex size-7 items-center justify-center rounded-lg bg-red-600/90 hover:bg-red-600 text-white shadow-xs transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {isActing ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <Trash2 className="size-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Empty Upload Slots */}
          {Array.from({ length: emptyGallerySlots }).map((_, index) => {
            const isNextUploadSlot = index === 0;
            const canUploadThisSlot = currentTotal < MAX_TOTAL_PHOTOS;

            return (
              <div
                key={`empty-slot-${index}`}
                onClick={() => {
                  if (canUploadThisSlot && !isUploading) {
                    setTargetSlot("gallery");
                    galleryInputRef.current?.click();
                  }
                }}
                className={cn(
                  "relative aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-3 text-center transition-all select-none",
                  canUploadThisSlot
                    ? "border-soft-border/80 bg-[#fdfafb] hover:border-berry/40 hover:bg-[#faecef]/30 cursor-pointer group"
                    : "border-gray-200 bg-gray-50/70 opacity-60 cursor-not-allowed"
                )}
              >
                {isUploading && targetSlot === "gallery" && isNextUploadSlot ? (
                  <div className="flex flex-col items-center gap-1.5 text-berry">
                    <Loader2 className="size-5 animate-spin" />
                    <span className="text-[11px] font-bold">{uploadProgress}%</span>
                    <span className="text-[10px] text-muted-foreground">Uploading...</span>
                  </div>
                ) : (
                  <>
                    <div
                      className={cn(
                        "flex size-10 items-center justify-center rounded-full transition-transform group-hover:scale-110",
                        canUploadThisSlot
                          ? "bg-berry/10 text-berry"
                          : "bg-gray-200 text-gray-400"
                      )}
                    >
                      <Plus className="size-5" />
                    </div>
                    <span className="mt-2 text-xs font-semibold text-foreground">
                      {canUploadThisSlot ? "Add Photo" : "Slot Locked"}
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">
                      {canUploadThisSlot ? "Tap to upload" : "Limit reached"}
                    </span>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Hidden Input for Gallery */}
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleGalleryFileChange}
          className="hidden"
          disabled={isUploading}
        />
      </div>

      {/* Full-Screen Carousel Viewer */}
      <ImageCarouselModal
        isOpen={carouselOpen}
        onClose={() => setCarouselOpen(false)}
        images={
          galleryPhotos.length > 0
            ? galleryPhotos.map((p) => ({
                id: p.id,
                url: p.imageUrl || p.thumbnailUrl || "",
                thumbnailUrl: p.thumbnailUrl,
                isProfilePhoto: p.isProfilePhoto,
              }))
            : displayAvatarUrl
              ? [
                  {
                    id: "avatar",
                    url: displayAvatarUrl,
                    thumbnailUrl: displayAvatarUrl,
                    isProfilePhoto: true,
                  },
                ]
              : []
        }
        currentIndex={carouselIndex}
        onNavigate={setCarouselIndex}
      />
    </section>
  );
}
