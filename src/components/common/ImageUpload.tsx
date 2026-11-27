import React, { useState, useRef } from 'react';
import { UploadCloud, X, Loader2, Image as ImageIcon, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { uploadFile, StorageBucket } from '../../services/storageService';

interface ImageUploadProps {
  label?: string;
  value?: string;
  onChange: (url: string) => void;
  bucket: StorageBucket;
  userId?: string;
  folder?: string;
  aspectRatio?: 'square' | 'video' | 'banner';
  placeholderText?: string;
  disabled?: boolean;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  label = 'Upload Photo',
  value,
  onChange,
  bucket,
  userId,
  folder = 'general',
  aspectRatio = 'video',
  placeholderText = 'Click or drag & drop image to upload',
  disabled = false,
  className = '',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlFallback, setShowUrlFallback] = useState(false);
  const [manualUrl, setManualUrl] = useState(value || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectClass =
    aspectRatio === 'square'
      ? 'aspect-square w-32'
      : aspectRatio === 'banner'
      ? 'aspect-[3/1] w-full'
      : 'aspect-[16/9] w-full';

  const handleFile = async (file: File) => {
    if (!file) return;

    if (!userId) {
      setUploadError('Please log in with an authenticated account to upload photos.');
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const result = await uploadFile({
        bucket,
        file,
        userId,
        folder
      });
      onChange(result.publicUrl);
      setManualUrl(result.publicUrl);
    } catch (err: any) {
      console.error('[ImageUpload] Error:', err);
      setUploadError(err.message || 'Failed to upload photo to cloud storage.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setManualUrl('');
    setUploadError(null);
  };

  const handleManualUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualUrl.trim()) {
      onChange(manualUrl.trim());
      setShowUrlFallback(false);
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        {label && <label className="block text-xs font-semibold text-slate-700">{label}</label>}
        <button
          type="button"
          onClick={() => setShowUrlFallback(!showUrlFallback)}
          className="text-[11px] text-emerald-700 hover:text-emerald-800 flex items-center gap-1 font-medium"
        >
          <LinkIcon className="w-3 h-3" />
          {showUrlFallback ? 'Upload File' : 'Paste URL instead'}
        </button>
      </div>

      {showUrlFallback ? (
        <div className="flex gap-2">
          <input
            type="url"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            placeholder="https://images.unsplash.com/... or cloud image URL"
            className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="button"
            onClick={handleManualUrlSubmit}
            className="px-3 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
          >
            Apply
          </button>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center p-3 text-center ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50'
              : value
              ? 'border-slate-200 bg-slate-50'
              : 'border-slate-200 hover:border-emerald-400 bg-slate-50/50 hover:bg-emerald-50/20'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${aspectClass}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/avif"
            onChange={handleFileChange}
            disabled={disabled || isUploading}
            className="hidden"
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-2 text-emerald-700">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-xs font-medium">Uploading to Supabase Storage...</span>
            </div>
          ) : value ? (
            <div className="relative w-full h-full group">
              <img
                src={value}
                alt="Uploaded preview"
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80';
                }}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                <button
                  type="button"
                  onClick={handleRemove}
                  className="p-1.5 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition-colors shadow-md"
                  title="Remove Image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 text-slate-500">
              <div className="w-9 h-9 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center text-emerald-700">
                <UploadCloud className="w-5 h-5" />
              </div>
              <p className="text-xs font-medium text-slate-700">{placeholderText}</p>
              <p className="text-[10px] text-slate-400">PNG, JPG, WEBP up to 10MB</p>
            </div>
          )}
        </div>
      )}

      {uploadError && (
        <div className="flex items-start gap-1.5 p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span>{uploadError}</span>
          </div>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="text-rose-500 hover:text-rose-700"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
