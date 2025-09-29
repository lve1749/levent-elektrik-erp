'use client';

import React from 'react';
import {
  formatBytes,
  useFileUpload,
  type FileMetadata,
  type FileWithPreview,
} from '@/hooks/use-file-upload';
import { Alert, AlertContent, AlertDescription, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { FileIcon, PlusIcon, TriangleAlert, XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadCompactProps {
  maxFiles?: number;
  maxSize?: number;
  accept?: string;
  multiple?: boolean;
  className?: string;
  onFilesChange?: (files: FileWithPreview[]) => void;
  clearTrigger?: number; // Dosyaları temizlemek için trigger
}

export default function FileUploadCompact({
  maxFiles = 3,
  maxSize = 2 * 1024 * 1024, // 2MB
  accept = 'image/*',
  multiple = true,
  className,
  onFilesChange,
  clearTrigger,
}: FileUploadCompactProps) {
  const [
    { files, isDragging, errors },
    { removeFile, handleDragEnter, handleDragLeave, handleDragOver, handleDrop, openFileDialog, getInputProps, clearFiles },
  ] = useFileUpload({
    maxFiles,
    maxSize,
    accept,
    multiple,
    onFilesChange,
  });

  // clearTrigger değiştiğinde dosyaları temizle
  React.useEffect(() => {
    if (clearTrigger && clearTrigger > 0) {
      clearFiles();
    }
  }, [clearTrigger, clearFiles]);

  const isImage = (file: File | FileMetadata) => {
    const type = file instanceof File ? file.type : file.type;
    return type.startsWith('image/');
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Compact Upload Area */}
      <div
        className={cn(
          'flex items-center gap-3 rounded-lg border border-dashed p-5 transition-colors',
          'bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.14_0.00_0)]',
          isDragging ? 'border-[oklch(0.55_0.22_263)] bg-[oklch(0.55_0.22_263)]/5 dark:bg-[oklch(0.55_0.22_263)]/10' : 'border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] hover:border-[oklch(0.80_0.00_0)] dark:hover:border-[oklch(0.40_0.00_0)]',
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input {...getInputProps()} className="sr-only" />

        {/* Upload Button */}
        <Button 
          type="button"
          onClick={openFileDialog} 
          size="sm" 
          className={cn(
            'h-8 text-xs bg-[oklch(0.55_0.22_263)] hover:bg-[oklch(0.50_0.22_263)] text-white',
            isDragging && 'animate-bounce'
          )}
        >
          <PlusIcon className="h-3.5 w-3.5" />
          Dosya Ekle
        </Button>

        {/* File Previews */}
        <div className="flex flex-1 items-center gap-2">
          {files.length === 0 ? (
            <p className="text-xs text-[oklch(0.50_0.00_0)] dark:text-[oklch(0.60_0.00_0)]">Dosyaları buraya sürükleyin veya seçmek için tıklayın (maks. {maxFiles} dosya)</p>
          ) : (
            files.map((fileItem) => (
              <div key={fileItem.id} className="group shrink-0">
                {/* File Preview */}
                <div className="relative">
                  {isImage(fileItem.file) && fileItem.preview ? (
                    <img
                      src={fileItem.preview}
                      alt={fileItem.file.name}
                      className="h-12 w-12 rounded-lg border object-cover"
                      title={`${fileItem.file.name} (${formatBytes(fileItem.file.size)})`}
                    />
                  ) : (
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-lg border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] bg-[oklch(0.95_0.00_0)] dark:bg-[oklch(0.18_0.00_0)]"
                      title={`${fileItem.file.name} (${formatBytes(fileItem.file.size)})`}
                    >
                      <FileIcon className="h-5 w-5 text-[oklch(0.50_0.00_0)] dark:text-[oklch(0.60_0.00_0)]" />
                    </div>
                  )}

                  {/* Remove Button */}
                  <Button
                    onClick={() => removeFile(fileItem.id)}
                    variant="destructive"
                    size="icon"
                    className="size-5 border-2 border-background absolute -right-2 -top-2 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <XIcon className="size-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* File Count */}
        {files.length > 0 && (
          <div className="shrink-0 text-xs text-[oklch(0.50_0.00_0)] dark:text-[oklch(0.60_0.00_0)]">
            {files.length}/{maxFiles}
          </div>
        )}
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <Alert variant="destructive" appearance="light" className="mt-3">
          <AlertIcon>
            <TriangleAlert className="h-4 w-4" />
          </AlertIcon>
          <AlertContent>
            <AlertTitle className="text-[13px] font-medium">Dosya yükleme hatası</AlertTitle>
            <AlertDescription className="text-[13px]">
              {errors.map((error, index) => (
                <p key={index} className="text-[13px] last:mb-0">
                  {error}
                </p>
              ))}
            </AlertDescription>
          </AlertContent>
        </Alert>
      )}
    </div>
  );
}
