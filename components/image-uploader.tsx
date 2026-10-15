'use client';

import { useRef, useState, useCallback } from 'react';
import { ImageUploadItem } from '@/types';
import { X, Upload, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  items: ImageUploadItem[];
  onChange: (items: ImageUploadItem[]) => void;
  maxFiles?: number;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ImageUploader({ items, onChange, maxFiles = 3 }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files) return;
      const remaining = maxFiles - items.length;
      const toAdd = Array.from(files).slice(0, remaining);

      const newItems: ImageUploadItem[] = await Promise.all(
        toAdd.map(async (file) => ({
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          file,
          previewUrl: URL.createObjectURL(file),
          base64: await fileToBase64(file),
        }))
      );
      onChange([...items, ...newItems]);
    },
    [items, maxFiles, onChange]
  );

  const remove = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (item) URL.revokeObjectURL(item.previewUrl);
    onChange(items.filter((i) => i.id !== id));
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      {items.length < maxFiles && (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-colors ${
            dragging
              ? 'border-purple-400 bg-purple-500/10'
              : 'border-white/20 bg-white/5 hover:border-purple-400/60 hover:bg-white/10'
          }`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/20">
            <Upload className="h-5 w-5 text-purple-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-white">
              Drop product photos here or <span className="text-purple-400">browse</span>
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Up to {maxFiles} images · JPG, PNG, WEBP
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      )}

      {/* Previews */}
      {items.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {items.map((item) => (
            <div key={item.id} className="group relative aspect-square overflow-hidden rounded-lg border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.previewUrl}
                alt={item.file.name}
                className="h-full w-full object-cover"
              />
              <button
                onClick={() => remove(item.id)}
                className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {items.length < maxFiles && (
            <button
              onClick={() => inputRef.current?.click()}
              className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-white/20 text-slate-400 transition-colors hover:border-purple-400/60 hover:text-purple-400"
            >
              <ImageIcon className="h-6 w-6" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
