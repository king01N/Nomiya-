import React from 'react';
import { X, Download } from 'lucide-react';

interface ImageViewerModalProps {
  isOpen: boolean;
  imageUrl: string | null;
  onClose: () => void;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  isOpen,
  imageUrl,
  onClose,
}) => {
  if (!isOpen || !imageUrl) return null;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `chat-photo-${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="flex items-center justify-between text-white py-2 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        <button
          onClick={handleDownload}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
          title="Download image"
        >
          <Download className="w-5 h-5" />
        </button>
      </div>

      <div
        className="flex-1 flex items-center justify-center p-2 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt="Full screen view"
          className="max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl"
        />
      </div>

      <div className="h-6"></div>
    </div>
  );
};
