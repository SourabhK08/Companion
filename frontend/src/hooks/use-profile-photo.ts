"use client";

import { useState, useCallback, useMemo } from "react";
import { apiFetch } from "@/lib/api/client";
import { useAuth } from "@/hooks/use-auth";

export interface ProfilePhotoItem {
  id: string;
  storageKey: string;
  originalFilename: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  width: number | null;
  height: number | null;
  sortOrder: number;
  isProfilePhoto: boolean;
  status: string;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  createdAt: string;
}

interface UploadUrlResponse {
  success: boolean;
  data: {
    upload: {
      signature: string;
      timestamp: number;
      cloudName: string;
      apiKey: string;
      folder: string;
      publicId: string;
      uploadUrl: string;
      params?: Record<string, string>;
    };
    photoId: string;
    storageKey: string;
  };
}

interface CompleteUploadResponse {
  success: boolean;
  data: {
    photo: ProfilePhotoItem;
  };
}

interface PhotosListResponse {
  success: boolean;
  data: {
    photos: ProfilePhotoItem[];
  };
}

export const MAX_TOTAL_PHOTOS = 5;
export const MAX_GALLERY_PHOTOS = 4;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export interface UploadPhotoOptions {
  setAsAvatar?: boolean;
}

export function useProfilePhoto() {
  const { refreshUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<ProfilePhotoItem[]>([]);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);

  const fetchPhotos = useCallback(async () => {
    setIsLoadingPhotos(true);
    try {
      const res = await apiFetch<PhotosListResponse>("/api/profile/photos");
      if (res.success && res.data?.photos) {
        setPhotos(res.data.photos);
      }
    } catch (err) {
      console.error("Failed to fetch photos", err);
    } finally {
      setIsLoadingPhotos(false);
    }
  }, []);

  const uploadPhoto = useCallback(
    async (file: File, options?: UploadPhotoOptions): Promise<ProfilePhotoItem | null> => {
      setError(null);

      // 1. Validation
      if (!ALLOWED_TYPES.includes(file.type)) {
        const msg = "Invalid file type. Please upload a JPG, PNG, WebP, or GIF image.";
        setError(msg);
        throw new Error(msg);
      }

      if (file.size > MAX_SIZE_BYTES) {
        const msg = "File is too large. Maximum allowed size is 10MB.";
        setError(msg);
        throw new Error(msg);
      }

      setIsUploading(true);
      setUploadProgress(5);

      try {
        // 2. Request signed upload signature from backend
        const signatureRes = await apiFetch<UploadUrlResponse>(
          "/api/profile/photos/upload-url",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              filename: file.name,
              contentType: file.type,
              size: file.size,
            }),
          }
        );

        if (!signatureRes.success || !signatureRes.data) {
          throw new Error("Failed to initialize photo upload");
        }

        const { upload, photoId } = signatureRes.data;
        setUploadProgress(20);

        // 3. Direct browser upload to Cloudinary via FormData
        const formData = new FormData();
        if (upload.params) {
          for (const [key, value] of Object.entries(upload.params)) {
            formData.append(key, value);
          }
        } else {
          formData.append("api_key", upload.apiKey);
          formData.append("timestamp", String(upload.timestamp));
          formData.append("signature", upload.signature);
          formData.append("folder", upload.folder);
          formData.append("public_id", upload.publicId);
        }
        formData.append("file", file);

        const cloudRes = await new Promise<{
          public_id: string;
          width?: number;
          height?: number;
          bytes?: number;
          format?: string;
          secure_url?: string;
        }>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", upload.uploadUrl);

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percent = 20 + Math.round((event.loaded / event.total) * 60);
              setUploadProgress(Math.min(percent, 80));
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const parsed = JSON.parse(xhr.responseText);
                resolve(parsed);
              } catch {
                reject(new Error("Invalid response from image server"));
              }
            } else {
              try {
                const errJson = JSON.parse(xhr.responseText);
                reject(
                  new Error(errJson.error?.message || `Upload failed with status ${xhr.status}`)
                );
              } catch {
                reject(new Error(`Upload failed with status ${xhr.status}`));
              }
            }
          };

          xhr.onerror = () => {
            reject(new Error("Network error during image upload to Cloudinary"));
          };

          xhr.send(formData);
        });

        setUploadProgress(85);

        // 4. Confirm upload with Express backend
        const completeRes = await apiFetch<CompleteUploadResponse>(
          "/api/profile/photos/complete",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              photoId,
              publicId: cloudRes.public_id,
              width: cloudRes.width,
              height: cloudRes.height,
              bytes: cloudRes.bytes,
              format: cloudRes.format,
              secureUrl: cloudRes.secure_url,
              setAsAvatar: options?.setAsAvatar,
            }),
          }
        );

        if (!completeRes.success || !completeRes.data?.photo) {
          throw new Error("Failed to confirm uploaded image");
        }

        setUploadProgress(100);

        // 5. Refresh user session and photo list
        await refreshUser();
        await fetchPhotos();

        return completeRes.data.photo;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "An unexpected error occurred during upload.";
        setError(errorMsg);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    [refreshUser, fetchPhotos]
  );

  const setAsAvatar = useCallback(
    async (photoId: string) => {
      setError(null);
      try {
        await apiFetch<{ success: boolean; data: { photos: ProfilePhotoItem[] } }>(
          `/api/profile/photos/${photoId}/set-avatar`,
          { method: "PATCH" }
        );
        await refreshUser();
        await fetchPhotos();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to set profile photo";
        setError(msg);
        throw err;
      }
    },
    [refreshUser, fetchPhotos]
  );

  const removeAvatar = useCallback(async () => {
    setError(null);
    try {
      await apiFetch<{ success: boolean }>(`/api/profile/photos/avatar`, {
        method: "DELETE",
      });
      await refreshUser();
      await fetchPhotos();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to remove avatar";
      setError(msg);
      throw err;
    }
  }, [refreshUser, fetchPhotos]);

  const deletePhoto = useCallback(
    async (photoId: string) => {
      setError(null);
      try {
        await apiFetch<{ success: boolean; message: string }>(
          `/api/profile/photos/${photoId}`,
          { method: "DELETE" }
        );
        await refreshUser();
        await fetchPhotos();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to delete photo";
        setError(msg);
        throw err;
      }
    },
    [refreshUser, fetchPhotos]
  );

  const avatarPhoto = useMemo(
    () => photos.find((p) => p.isProfilePhoto) || null,
    [photos]
  );

  const galleryPhotos = useMemo(
    () => photos.filter((p) => !p.isProfilePhoto),
    [photos]
  );

  const canUploadMore = photos.length < MAX_TOTAL_PHOTOS;
  const canUploadGallery = galleryPhotos.length < MAX_GALLERY_PHOTOS;

  return {
    uploadPhoto,
    deletePhoto,
    setAsAvatar,
    removeAvatar,
    fetchPhotos,
    photos,
    avatarPhoto,
    galleryPhotos,
    canUploadMore,
    canUploadGallery,
    isUploading,
    uploadProgress,
    error,
    isLoadingPhotos,
  };
}
