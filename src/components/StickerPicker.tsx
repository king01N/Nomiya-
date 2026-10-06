import React, { useState } from 'react';
import { STICKER_COLLECTION } from '../data/stickers';
import { StickerItem } from '../types';
import { X, Sparkles, Heart, Smile, Flame, Coffee } from 'lucide-react';

interface StickerPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSticker: (sticker: StickerItem) => void;
}

export const StickerPicker: React.FC<StickerPickerProps> = ({
  isOpen,
  onClose,
  onSelectSticker,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'All', icon: Sparkles },
    { id: 'emotions', label: 'Emotions', icon: Heart },
    { id: 'cute', label: 'Cute', icon: Smile },
    { id: 'reactions', label: 'Reactions', icon: Flame },
    { id: 'vibes', label: 'Vibes', icon: Coffee },
  ];

  const filteredStickers =
    activeCategory === 'all'
      ? STICKER_COLLECTION
      : STICKER_COLLECTION.filter((s) => s.category === activeCategory);

  return (
    <div className="absolute inset-x-0 bottom-0 z-40 bg-white rounded-t-3xl shadow-2xl border-t border-neutral-200/80 max-h-[380px] flex flex-col animate-in slide-in-from-bottom duration-200">
      {/* Drawer Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <span className="text-xl">✨</span>
          <span className="font-semibold text-neutral-800 text-sm">
            Stickers & Reactions
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded-full hover:bg-neutral-100 transition-colors"
          aria-label="Close stickers"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 px-4 py-2 overflow-x-auto border-b border-neutral-100 no-scrollbar">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#008069] text-white shadow-2xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200/70'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Stickers Grid */}
      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-4 sm:grid-cols-6 gap-3">
        {filteredStickers.map((sticker) => (
          <button
            key={sticker.id}
            onClick={() => {
              onSelectSticker(sticker);
              onClose();
            }}
            className="flex flex-col items-center justify-center p-3 rounded-2xl hover:bg-emerald-50 active:scale-90 transition-all border border-transparent hover:border-emerald-200 group"
          >
            <span className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform">
              {sticker.emoji}
            </span>
            <span className="text-[10px] text-neutral-500 mt-1 truncate max-w-full">
              {sticker.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
