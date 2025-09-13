import React, { useState, useRef } from "react";
import { X, Image as ImageIcon } from "lucide-react";
import { Button } from "./Button";

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  onImageRemove: () => void;
  previewUrl?: string;
  className?: string;
  maxSize?: number; // in MB
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageSelect,
  onImageRemove,
  previewUrl,
  className = "",
  maxSize = 5,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    // Check file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return false;
    }

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return false;
    }

    setError(null);
    return true;
  };

  const handleFileSelect = (file: File) => {
    if (validateFile(file)) {
      onImageSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    onImageRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setError(null);
  };

  return (
    <div className={className}>
      {previewUrl ? (
        // Preview with remove option
        <div className="relative inline-block">
          <img
            src={previewUrl}
            alt="Preview"
            className="max-h-32 max-w-full rounded-lg border"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        // Upload area
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-4 cursor-pointer transition-colors
            ${
              isDragging
                ? "border-primary-500 bg-primary-50"
                : "border-gray-300 hover:border-gray-400"
            }
          `}
        >
          <div className="flex flex-col items-center text-center">
            <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">
              <span className="text-primary-600 hover:text-primary-500">
                Click to upload
              </span>{" "}
              or drag and drop
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, GIF up to {maxSize}MB
            </p>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
};
