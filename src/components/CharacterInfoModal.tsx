import React from 'react';
import { X, Phone, Video, Heart, Sparkles, MessageCircle } from 'lucide-react';

interface CharacterInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  characterName: string;
  characterAvatar: string;
  onStartVoiceCall: () => void;
  onStartVideoCall: () => void;
}

export const CharacterInfoModal: React.FC<CharacterInfoModalProps> = ({
  isOpen,
  onClose,
  characterName,
  characterAvatar,
  onStartVoiceCall,
  onStartVideoCall,
}) => {
  if (!isOpen) return null;

  const characterTraits = [
    'Friendly & Sweet',
    'Warm & Caring',
    'Loves Late Night Talks',
    'Chai & Fun',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150 select-none">
      <div className="bg-[#26052c] border border-purple-900/60 rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-white">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-purple-900/40">
          <h2 className="font-bold text-lg text-white">Contact Info</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-pink-300 hover:text-white hover:bg-purple-900/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center text-center max-h-[75vh] overflow-y-auto">
          {/* Avatar Profile */}
          <div className="relative mb-3">
            <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-pink-500/80 shadow-[0_0_20px_rgba(255,42,133,0.35)]">
              <img
                src={characterAvatar}
                alt={characterName}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="absolute bottom-1 right-2 w-4 h-4 rounded-full bg-pink-400 border-2 border-[#26052c] animate-pulse"></span>
          </div>

          <h3 className="text-xl font-bold text-white mb-0.5">{characterName}</h3>
          <p className="text-xs text-pink-300/80 mb-5">Online</p>

          {/* Call Actions */}
          <div className="flex items-center justify-center gap-6 w-full pb-5 border-b border-purple-900/40">
            <button
              onClick={() => {
                onClose();
                onStartVoiceCall();
              }}
              className="flex flex-col items-center gap-1.5 text-xs text-pink-200 hover:text-white transition-colors group"
            >
              <div className="w-12 h-12 rounded-full bg-purple-900/60 group-hover:bg-purple-900/90 flex items-center justify-center border border-purple-700/50 shadow-sm transition-transform active:scale-95">
                <Phone className="w-5 h-5 text-pink-300" />
              </div>
              <span className="font-medium">Audio Call</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onStartVideoCall();
              }}
              className="flex flex-col items-center gap-1.5 text-xs text-pink-200 hover:text-white transition-colors group"
            >
              <div className="w-12 h-12 rounded-full bg-purple-900/60 group-hover:bg-purple-900/90 flex items-center justify-center border border-purple-700/50 shadow-sm transition-transform active:scale-95">
                <Video className="w-5 h-5 text-pink-300" />
              </div>
              <span className="font-medium">Video Call</span>
            </button>

            <button
              onClick={onClose}
              className="flex flex-col items-center gap-1.5 text-xs text-pink-200 hover:text-white transition-colors group"
            >
              <div className="w-12 h-12 rounded-full bg-purple-900/60 group-hover:bg-purple-900/90 flex items-center justify-center border border-purple-700/50 shadow-sm transition-transform active:scale-95">
                <MessageCircle className="w-5 h-5 text-pink-300" />
              </div>
              <span className="font-medium">Message</span>
            </button>
          </div>

          {/* About / Bio */}
          <div className="w-full text-left py-4 border-b border-purple-900/40">
            <h4 className="text-xs font-semibold text-pink-300/80 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-pink-400" />
              About
            </h4>
            <p className="text-sm text-pink-100/90 leading-relaxed">
              Sweet, warm, and playful. Loves chatting with you, sharing everyday moments, listening to your stories, and always being there for you.
            </p>
          </div>

          {/* Traits */}
          <div className="w-full text-left pt-4">
            <h4 className="text-xs font-semibold text-pink-300/80 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              Vibes
            </h4>
            <div className="flex flex-wrap gap-2">
              {characterTraits.map((trait, idx) => (
                <span
                  key={idx}
                  className="bg-purple-900/50 text-pink-200 border border-purple-700/40 text-[11px] font-medium px-3 py-1 rounded-full shadow-2xs"
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
