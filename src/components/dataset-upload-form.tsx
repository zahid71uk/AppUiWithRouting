"use client";

import { LoaderCircle, Upload } from "lucide-react";
import { useState, type FormEvent } from "react";

import { useDatasetUpload } from "@/hooks/use-dataset-upload";

export function DatasetUploadForm({ maxUploadBytes }: { maxUploadBytes: number }) {
  const [file, setFile] = useState<File | null>(null);
  const [token, setToken] = useState("");
  const { upload, isUploading, error, message } = useDatasetUpload(maxUploadBytes);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (file) await upload(file, token);
  }

  return (
    <form className="dataset-upload-form" onSubmit={handleSubmit}>
      <div className="dataset-upload-fields">
        <div className="field">
          <label htmlFor="dataset-file">CSV file</label>
          <input
            id="dataset-file"
            name="file"
            type="file"
            accept=".csv,text/csv"
            required
            onChange={(event) => setFile(event.currentTarget.files?.[0] ?? null)}
            aria-describedby="dataset-file-limit"
          />
          <p className="dataset-upload-hint" id="dataset-file-limit">
            Maximum {(maxUploadBytes / (1024 * 1024)).toFixed(0)} MB
          </p>
        </div>
        <div className="field">
          <label htmlFor="dataset-upload-token">Upload token</label>
          <input
            id="dataset-upload-token"
            type="password"
            autoComplete="current-password"
            required
            value={token}
            onChange={(event) => setToken(event.currentTarget.value)}
          />
        </div>
      </div>
      <div className="dataset-upload-footer">
        <p className="privacy-note">The uploaded CSV becomes the active training and analysis dataset.</p>
        <button className="button button-primary" type="submit" disabled={isUploading || !file}>
          {isUploading ? <LoaderCircle className="spin" size={16} aria-hidden="true" /> : <Upload size={16} aria-hidden="true" />}
          {isUploading ? "Training model" : "Upload and train"}
        </button>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      {message && <p className="dataset-upload-message" role="status" aria-live="polite">{message}</p>}
    </form>
  );
}