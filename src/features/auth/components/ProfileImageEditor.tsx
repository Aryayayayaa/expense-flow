"use client";

import { useRef, useState, useEffect } from "react";
import { upload } from "@vercel/blob/client";

import { updateOwnImageAction } from "../actions/account-actions";

type Props = {
  currentImage: string | null;
};

export default function ProfileImageEditor({ currentImage }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!currentImage) {
      setImage(null);
      return;
    }

    let cancelled = false;

    async function loadImage() {
      try {
        const response = await fetch("/api/profile/image");

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (!cancelled) {
          setImage(data.url);
        }
      } catch (error) {
        console.error("Profile image load error:", error);
      }
    }

    loadImage();

    return () => {
      cancelled = true;
    };
  }, [currentImage]);

  async function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setMessage("Please select a JPG, PNG, or WEBP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Profile image must be smaller than 5 MB.");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      const extension = file.type.split("/")[1] ?? "jpg";

      const blob = await upload(
        `profile/profile-image-${Date.now()}.${extension}`,
        file,
        {
          access: "private",
          handleUploadUrl: "/api/profile/image",
        },
      );

      const result = await updateOwnImageAction(blob.url);

      if (!result.success) {
        setMessage(result.message);
        return;
      }

      const imageResponse = await fetch("/api/profile/image");

      if (imageResponse.ok) {
        const imageData = await imageResponse.json();
        setImage(imageData.url);
      }
      setMessage(result.message);
    } catch (error) {
      console.error("Profile image update error:", error);
      setMessage("Unable to update profile photo.");
    } finally {
      setUploading(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-5">
        {image ? (
          <img
            src={image}
            alt="Profile"
            className="h-20 w-20 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-200 text-2xl font-semibold text-slate-600">
            ?
          </div>
        )}

        <div>
          <p className="text-sm font-medium text-slate-500">Profile Photo</p>

          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="mt-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Change Photo"}
          </button>

          <input
            ref={inputRef}
            type="file"
            accept="image/jpg,image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>
      </div>

      {message && <p className="mt-4 text-sm text-slate-600">{message}</p>}
    </div>
  );
}
