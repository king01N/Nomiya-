import React from 'react';
import { Phone, Video, MoreVertical } from 'lucide-react';

interface HeaderProps {
  characterName: string;
  characterAvatar: string;
  isTyping: boolean;
  onOpenVoiceCall: () => void;
  onOpenVideoCall: () => void;
  onOpenMenu: () => void;
  onOpenCharacterInfo: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  characterName,
  characterAvatar,
  isTyping,
  onOpenVoiceCall,
  onOpenVideoCall,
  onOpenMenu,
  onOpenCharacterInfo,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-3.5 py-2.5 shadow-md select-none bg-[#240529] border-b border-purple-950/60 text-white shadow-purple-950/20">
      {/* Left: Avatar + Character Name & Status */}
      <div
        onClick={onOpenCharacterInfo}
        className="flex items-center gap-3 cursor-pointer group flex-1 min-w-0"
        role="button"
        tabIndex={0}
        aria-label="View profile"
      >
        <div className="relative flex-shrink-0">
          <img
            src={characterAvatar}
            alt={characterName}
            className="w-10 h-10 rounded-full object-cover shadow-sm border-2 border-pink-500/80 shadow-[0_0_10px_rgba(255,42,133,0.4)]"
          />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 bg-pink-400 border-[#240529] animate-pulse"></span>
        </div>

        <div className="min-w-0 flex flex-col justify-center text-left">
          <h1 className="font-semibold text-[16px] leading-tight truncate text-white flex items-center gap-1.5">
            <span>{characterName}</span>
          </h1>
          <p className="text-[12px] leading-tight truncate flex items-center gap-1 text-pink-200/80">
            {isTyping ? (
              <span className="text-pink-300 font-medium italic animate-pulse">
                typing...
              </span>
            ) : (
              <span>online</span>
            )}
          </p>
        </div>
      </div>

      {/* Right side: Video call, Voice call, Three-dot menu */}
      <div className="flex items-center gap-1 text-white">
        <button
          onClick={onOpenVideoCall}
          className="p-2 rounded-full transition-colors hover:bg-pink-500/20 active:bg-pink-500/30 text-pink-200"
          title="Video call"
          aria-label="Video call"
        >
          <Video className="w-5 h-5" />
        </button>

        <button
          onClick={onOpenVoiceCall}
          className="p-2 rounded-full transition-colors hover:bg-pink-500/20 active:bg-pink-500/30 text-pink-200"
          title="Voice call"
          aria-label="Voice call"
        >
          <Phone className="w-5 h-5" />
        </button>

        <button
          onClick={onOpenMenu}
          className="p-2 rounded-full transition-colors hover:bg-pink-500/20 active:bg-pink-500/30 text-pink-200"
          title="More options"
          aria-label="Menu"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
