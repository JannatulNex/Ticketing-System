import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ExistingFile = {
  name: string;
  url?: string;
};

type FileDropzoneProps = {
  value: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  disabled?: boolean;
  existingFile?: ExistingFile | null;
  onRemoveExisting?: () => void;
  hint?: string;
};

const formatBytes = (bytes?: number) => {
  if (!bytes) return "";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${size.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
};

export function FileDropzone({
  value,
  onChange,
  accept = "*/*",
  disabled,
  existingFile,
  onRemoveExisting,
  hint,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const openFileDialog = () => {
    if (!disabled) inputRef.current?.click();
  };

  const handleFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const file = files[0];
    onChange(file);
    setIsDragOver(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleRemove = () => onChange(null);

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          if (disabled) return;
          handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50/60 px-6 py-10 text-center transition hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900/40",
          disabled && "pointer-events-none opacity-60",
          isDragOver && "border-neutral-500 bg-neutral-100 dark:border-neutral-500 dark:bg-neutral-800"
        )}
        role="button"
        tabIndex={0}
        onClick={openFileDialog}
      >
        <CloudIcon className="h-10 w-10 text-neutral-500" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
            Choose a file or drag & drop it here
          </p>
          <p className="text-xs text-neutral-500">
            {hint ?? "PDF, PNG, JPG, or MP4 up to 25MB"}
          </p>
        </div>
        <Button type="button" variant="outline" disabled={disabled}>
          Browse File
        </Button>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept}
          onChange={(event) => handleFiles(event.target.files)}
          disabled={disabled}
        />
      </div>

      {value ? (
        <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
          <div className="truncate">
            <p className="truncate font-medium text-neutral-800 dark:text-neutral-100">{value.name}</p>
            <p className="text-xs text-neutral-500">{formatBytes(value.size)}</p>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={handleRemove}>
            <span className="sr-only">Remove file</span>
            <XIcon className="h-4 w-4" />
          </Button>
        </div>
      ) : existingFile ? (
        <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
          <div className="truncate">
            {existingFile.url ? (
              <a
                href={existingFile.url}
                target="_blank"
                rel="noreferrer"
                className="truncate font-medium text-blue-600 hover:underline"
              >
                {existingFile.name}
              </a>
            ) : (
              <p className="truncate font-medium text-neutral-800 dark:text-neutral-100">{existingFile.name}</p>
            )}
            <p className="text-xs text-neutral-500">Current attachment</p>
          </div>
          {onRemoveExisting ? (
            <Button type="button" variant="ghost" size="icon" onClick={onRemoveExisting}>
              <span className="sr-only">Remove current attachment</span>
              <XIcon className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function CloudIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7.5 18a4.5 4.5 0 0 1-.9-8.93A5.25 5.25 0 0 1 16.5 6a5.25 5.25 0 0 1 4.8 7.26" />
      <path d="M12 13v6" />
      <path d="m9 16 3 3 3-3" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
