"use client";

import { useState, useId } from "react";
import Image from "next/image";
import { useToast } from "./Toast";

export type UploadedImage = {
  _id: string;
  url: string;
  assetRef: {
    _type: "image";
    asset: { _type: "reference"; _ref: string };
  };
};

export default function ImageUpload({
  images,
  onImagesChange,
  multiple = true,
  label = "Images",
}: {
  images: UploadedImage[];
  onImagesChange: (images: UploadedImage[]) => void;
  multiple?: boolean;
  label?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputId = useId();
  const { toast } = useToast();

  const upload = async (files: FileList) => {
    setUploading(true);
    const newImages: UploadedImage[] = [];

    for (const file of Array.from(files)) {
      if (file.size > 5 * 1024 * 1024) {
        toast(`${file.name} exceeds 5MB limit`, "error");
        continue;
      }
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          newImages.push(data);
        } else {
          toast(`Failed to upload ${file.name}`, "error");
        }
      } catch {
        toast(`Failed to upload ${file.name}`, "error");
      }
    }

    if (newImages.length > 0) {
      onImagesChange(
        multiple ? [...images, ...newImages] : newImages.slice(-1)
      );
      toast(
        `${newImages.length} image${newImages.length > 1 ? "s" : ""} uploaded`,
        "success"
      );
    }
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) upload(e.dataTransfer.files);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) upload(e.target.files);
    e.target.value = "";
  };

  const removeImage = (_id: string) => {
    onImagesChange(images.filter((img) => img._id !== _id));
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 space-y-4">
      <h2 className="font-medium text-[#1A1A1A] text-sm uppercase tracking-widest">
        {label}
      </h2>

      {/* Preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {images.map((img) => (
            <div
              key={img._id}
              className="relative group aspect-square rounded-lg overflow-hidden bg-[#F5F0EB]"
            >
              <Image
                src={img.url}
                alt=""
                fill
                className="object-cover"
                sizes="200px"
              />
              <button
                type="button"
                onClick={() => removeImage(img._id)}
                className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 sm:p-10 text-center transition-colors ${
          dragOver
            ? "border-[#C08A6F] bg-[#C08A6F]/5"
            : "border-gray-200 hover:border-gray-300"
        }`}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <div className="w-6 h-6 border-2 border-[#C08A6F] border-t-transparent rounded-full animate-spin" />
            <p className="text-[#666] text-sm">Uploading...</p>
          </div>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-8 h-8 mx-auto text-[#999] mb-3"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
              />
            </svg>
            <p className="text-[#666] text-sm">
              Drag & drop or{" "}
              <label
                htmlFor={inputId}
                className="text-[#C08A6F] cursor-pointer hover:underline"
              >
                browse
              </label>
            </p>
            <p className="text-[#999] text-xs mt-1">
              PNG, JPG or WebP. Max 5MB each.
            </p>
            <input
              type="file"
              accept="image/*"
              multiple={multiple}
              className="hidden"
              id={inputId}
              onChange={handleChange}
            />
          </>
        )}
      </div>
    </div>
  );
}
