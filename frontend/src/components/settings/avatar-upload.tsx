"use client";

import React, { useRef, useState } from "react";
import { Camera, Loader2, AlertCircle } from "lucide-react";
import { useProfilePhoto } from "@/hooks/use-profile-photo";

interface AvatarUploadProps {
  currentAvatar: string | null | undefined;
  userName: string;
  onAvatarUpdated?: (newAvatarUrl: string) => void;
  size?: "sm" | "md" | "lg";
}

export function AvatarUpload({
  currentAvatar,
  userName,
  onAvatarUpdated,
  size = "md",
}: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { uploadPhoto, isUploading, uploadProgress } = useProfilePhoto();

  const handleCameraClick = () => {
    if (isUploading) return;
    setUploadError(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset input so same file can be selected again if needed
    event.target.value = "";

    // Show instant optimistic local preview
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);
    setUploadError(null);

    try {
      const confirmedPhoto = await uploadPhoto(file);
      if (confirmedPhoto?.imageUrl) {
        setLocalPreview(null); // clean up preview
        onAvatarUpdated?.(confirmedPhoto.imageUrl);
      }
    } catch (err) {
      setLocalPreview(null);
      setUploadError(err instanceof Error ? err.message : "Failed to upload avatar");
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  };

  const displayAvatar = localPreview || currentAvatar;
  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  const sizeClasses = {
    sm: "size-12 text-sm",
    md: "size-16 text-lg",
    lg: "size-24 text-2xl",
  }[size];

  const buttonSizeClasses = {
    sm: "size-5 -bottom-0.5 -right-0.5",
    md: "size-6 -bottom-1 -right-1",
    lg: "size-8 -bottom-1.5 -right-1.5",
  }[size];

  const iconSizeClasses = {
    sm: "size-2.5",
    md: "size-3",
    lg: "size-4",
  }[size];

  return (
    <div className="flex flex-col items-start gap-1.5">
      <div className={`relative ${sizeClasses} shrink-0`}>
        {/* Avatar Container */}
        <div
          className={`${sizeClasses} overflow-hidden rounded-full border-2 border-white shadow-sm bg-gradient-to-br from-dusty-rose to-berry flex items-center justify-center text-white font-bold relative select-none`}
        >
          {displayAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={displayAvatar}
              alt={userName}
              className="size-full object-cover"
            />
          ) : (
            <span>{initials}</span>
          )}

          {/* Loading Overlay */}
          {isUploading && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex flex-col items-center justify-center text-white z-10 transition-all">
              <Loader2 className="size-4 animate-spin mb-0.5" />
              <span className="text-[10px] font-semibold leading-none">{uploadProgress}%</span>
            </div>
          )}
        </div>

        {/* Camera Upload Button */}
        <button
          type="button"
          onClick={handleCameraClick}
          disabled={isUploading}
          aria-label="Upload photo"
          title="Change profile photo"
          className={`absolute ${buttonSizeClasses} flex items-center justify-center rounded-full bg-berry text-white shadow-md hover:bg-berry-dark transition-transform active:scale-95 disabled:opacity-50 cursor-pointer`}
        >
          {isUploading ? (
            <Loader2 className={`${iconSizeClasses} animate-spin`} />
          ) : (
            <Camera className={iconSizeClasses} />
          )}
        </button>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />
      </div>

      {/* Error Message */}
      {uploadError && (
        <div className="flex items-center gap-1 text-[11px] text-destructive mt-1 max-w-xs">
          <AlertCircle className="size-3 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}
    </div>
  );
}
