"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { datasetTrainingResponseSchema } from "@/lib/model-data";

const defaultMaximumBytes = 5 * 1024 * 1024;

export function useDatasetUpload(maximumBytes: number) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function upload(file: File, token: string): Promise<boolean> {
    setError("");
    setMessage("");
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Choose a CSV file.");
      return false;
    }
    if (file.size > (maximumBytes || defaultMaximumBytes)) {
      setError("The selected file exceeds the upload limit.");
      return false;
    }
    if (!token.trim()) {
      setError("Enter the dataset upload token.");
      return false;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/model-data/upload", {
        method: "POST",
        headers: { "X-Dataset-Upload-Token": token },
        body: formData,
      });
      const body: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const detail = typeof body === "object" && body !== null && "detail" in body
          ? String(body.detail)
          : typeof body === "object" && body !== null && "message" in body
            ? String(body.message)
            : "The dataset could not be promoted.";
        throw new Error(detail);
      }
      const parsed = datasetTrainingResponseSchema.safeParse(body);
      if (!parsed.success) throw new Error("The training service returned an invalid response.");
      setMessage(parsed.data.message);
      router.refresh();
      return true;
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "The dataset could not be promoted.");
      return false;
    } finally {
      setIsUploading(false);
    }
  }

  return { upload, isUploading, error, message };
}