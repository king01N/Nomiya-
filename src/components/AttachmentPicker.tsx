import React, { useRef } from 'react';
import { Image as GalleryIcon, Camera, FileText, X } from 'lucide-react';

interface AttachmentPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImageFile: (file: File) => void;
  onOpenCameraCapture: () => void;
}

export const AttachmentPicker: React.FC<AttachmentPickerProps> = ({
  isOpen,
  onClose,
  onSelectImageFile,
  onOpenCameraCapture,
}) => {
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onSelectImageFile(e.target.files[0]);
      onClose();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onSelectImageFile(e.target.files[0]);
      onClose();
    }
  };

  return (
    <>
      {/* Hidden file inputs */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleGalleryChange}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-2xs transition-opacity"
        onClick={onClose}
      />

      {/* Attachment Bottom Sheet / Popover */}
      <div className="absolute inset-x-2 bottom-16 z-50 bg-white rounded-3xl p-5 shadow-2xl border border-neutral-200/80 animate-in fade-in zoom-in-95 duration-150 max-w-sm mx-auto">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-neutral-100">
          <span className="font-semibold text-neutral-800 text-sm">
            Share content with companion
          </span>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-600 rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Gallery */}
          <button
            onClick={() => galleryInputRef.current?.click()}
            className="flex flex-col items-center gap-2 group active:scale-95 transition-transform"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 text-white flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <GalleryIcon className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-neutral-700">Gallery</span>
          </button>

          {/* Camera */}
          <button
            onClick={() => {
              onClose();
              onOpenCameraCapture();
            }}
            className="flex flex-col items-center gap-2 group active:scale-95 transition-transform"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <Camera className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-neutral-700">Camera</span>
          </button>

          {/* Document / File */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-2 group active:scale-95 transition-transform"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 text-white flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <FileText className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-neutral-700">Document</span>
          </button>
        </div>
      </div>
    </>
  );
};
