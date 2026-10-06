import React, { useState } from 'react';
import { X, Send, Sparkles } from 'lucide-react';

interface ImagePreviewModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onSend: (caption: string) => void;
  characterName: string;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  isOpen,
  imageSrc,
  onClose,
  onSend,
  characterName,
}) => {
  const [caption, setCaption] = useState('What do you think about this?');

  if (!isOpen || !imageSrc) return null;

  const handleSend = () => {
    onSend(caption);
    setCaption('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-4 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between text-white py-2">
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
          aria-label="Discard image"
        >
          <X className="w-6 h-6" />
        </button>
        <span className="text-sm font-medium text-white/80">
          Share photo with {characterName}
        </span>
        <div className="w-10"></div>
      </div>

      {/* Image Preview Canvas */}
      <div className="flex-1 flex items-center justify-center overflow-hidden my-3">
        <img
          src={imageSrc}
          alt="Preview before sending"
          className="max-h-[65vh] max-w-full object-contain rounded-xl shadow-2xl"
        />
      </div>

      {/* Bottom Composer Capsule */}
      <div className="w-full max-w-xl mx-auto flex items-center gap-2 pb-2">
        <div className="flex-1 bg-white/15 backdrop-blur-md rounded-full px-4 py-2 flex items-center border border-white/20 text-white">
          <Sparkles className="w-4 h-4 text-emerald-400 mr-2 flex-shrink-0" />
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a caption..."
            className="flex-1 bg-transparent text-white placeholder-white/50 text-sm outline-none"
            autoFocus
          />
        </div>

        <button
          onClick={handleSend}
          className="w-12 h-12 rounded-full bg-[#008069] hover:bg-[#00705c] active:scale-95 text-white flex items-center justify-center shadow-lg transition-transform"
          title="Send image"
        >
          <Send className="w-5 h-5 ml-0.5" />
        </button>
      </div>
    </div>
  );
};
