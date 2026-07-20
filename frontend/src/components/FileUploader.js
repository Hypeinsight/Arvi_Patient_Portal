"use client";

import { useEffect, useId, useRef, useState } from "react";
import { File, X, Check, FileText } from "lucide-react";

const DEFAULT_ACCEPTED_TYPES = [
  "image/jpeg",
  "image/jfif",
  "image/jpg",
  "image/png",
  "application/pdf",
];

export default function FileUploader({
  isOpen = true,
  title = "Upload Document",
  subTitle = "Upload any relevant documents",
  uploadText = "Choose a document to upload",
  uploadSubtext = "JPG, PNG, or PDF",
  formatText = "Format: JPG, PNG, PDF | Max size: 10 MB",
  accept = ".jpg,.jpeg,.png,.pdf",
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  maxSizeMb = 10,
  cancelText = "Cancel",
  importText = "Import",
  initialFile = null,
  onCancel,
  onImport,
}) {
  const [selectedFile, setSelectedFile] = useState(initialFile);
  const [error, setError] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);
  const titleId = useId();
  const fileInputId = useId();

  useEffect(() => {
    if (isOpen) setSelectedFile(initialFile);
  }, [isOpen, initialFile]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setError("");
      return undefined;
    }

    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !isImporting) onCancel?.();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [isOpen, isImporting, onCancel]);

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > maxSizeMb * 1024 * 1024) {
      setSelectedFile(null);
      setError(`File size must be less than ${maxSizeMb} MB`);
      event.target.value = "";
      return;
    }

    if (!acceptedTypes.includes(file.type)) {
      setSelectedFile(null);
      setError("Please select a JPG, PNG, or PDF file");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
    setError("");
  };

  const handleImport = async () => {
    if (!selectedFile || isImporting) return;

    setIsImporting(true);
    setError("");

    try {
      await onImport?.(selectedFile);
    } catch (importError) {
      setError(
        importError?.message ||
          "Could not import the document. Please try again.",
      );
    } finally {
      setIsImporting(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overscroll-contain bg-black/45 p-4 font-poppins"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isImporting) onCancel?.();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-2xl rounded-3xl bg-white p-5 shadow-2xl sm:py-6 2xl:pt-10 sm:px-6 lg:px-14"
      >
        <div className="flex items-start justify-between gap-4 mb-4 md:mb-7 2xl:mb-0">
          <div>
            <h2
              id={titleId}
              className="text-xl font-medium text-slate sm:text-[1.375rem]"
            >
              {title}
            </h2>
            <p className="text-slate text-sm">{subTitle}</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isImporting}
            aria-label="Close uploader"
            className="absolute right-4 md:right-6 top-4 md:top-6 rounded-lg bg-[#ff0000] p-0.25 xs:p-1 cursor-pointer text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-3 xs:h-4 w-3 xs:w-4" />
          </button>
        </div>

        <div className="h-[1px] bg-[#3333334D] hidden 2xl:block 2xl:my-7" />

        <div className="relative flex cursor-pointer w-full flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed p-[14px] border-blue-300 bg-gray-50 text-center transition-colors hover:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60">
          <div className="w-full h-full flex p-5 2xl:p-10 items-center justify-center bg-[#0575E614] hover:bg-[#03498f14] rounded-xl">
            <span className="relative z-10 flex flex-col items-center">
              <img
                src="/upload.png"
                alt=""
                aria-hidden="true"
                width="48"
                height="48"
                className="mb-2"
              />
              <span className="mb-1 text-lg font-medium text-slate md:text-[1.25rem] leading-7">
                {uploadText}
              </span>
              <span className="mb-4 text-xs md:text-sm text-slate leading-6">
                {uploadSubtext}
              </span>

              {selectedFile && (
                <span className="flex mb-4 items-center gap-2 rounded-full bg-blue-200 px-4 py-2 text-sm font-medium text-blue-700">
                  <File className="h-4 w-4 shrink-0" />
                  <span className="max-w-72 truncate">
                    {" "}
                    {selectedFile.name.length > 8
                      ? `${selectedFile.name.slice(0, 8)}...`
                      : selectedFile.name}
                  </span>
                </span>
              )}

              {!selectedFile ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isImporting}
                  className="rounded-lg flex items-center gap-0.5 cursor-pointer bg-gradient-to-tr from-[#032B4A] to-[#0575E6] px-5 py-2.75 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span>
                    <FileText className="w-5 h-5 text-[#032B4A]" fill="white"/>
                  </span>
                  Choose File
                </button>
              ) : (
                <div className="flex gap-3">
                  <label
                    htmlFor={fileInputId}
                    onClick={() => {
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="px-4 py-2 border-2 border-blue-600 text-blue-600 bg-white rounded-lg hover:bg-blue-50 transition-colors font-medium cursor-pointer"
                  >
                    Replace File
                  </label>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    disabled={isImporting}
                    className="px-4 py-2 border-2 border-red-600 text-red-600 bg-white rounded-lg hover:bg-red-50 transition-colors font-medium cursor-pointer"
                  >
                    Remove File
                  </button>
                </div>
              )}

              <span className="mt-4 text-xs text-slate">{formatText}</span>
            </span>
          </div>
        </div>

        <input
          id={fileInputId}
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
        />

        {error && (
          <p role="alert" className="mt-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="h-[1px] bg-[#3333334D] hidden 2xl:block 2xl:my-7" />

        <div className="flex justify-center xs:justify-end gap-3 mt-4 md:mt-7 2xl:mt-0">
          <button
            type="button"
            onClick={onCancel}
            disabled={isImporting}
            className="rounded-xl w-full xs:w-auto cursor-pointer bg-[#0318220A] px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={!selectedFile || isImporting}
            className="rounded-xl w-full xs:w-auto flex items-center justify-center gap-3 cursor-pointer bg-gradient-to-tr from-[#032B4A] to-[#0575E6] px-5 py-2.75 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span>
              <Check className="w-4 h-4 p-0.5 bg-white text-[#032B4A] rounded-sm" />
            </span>
            {isImporting ? "Importing..." : importText}
          </button>
        </div>
      </div>
    </div>
  );
}
