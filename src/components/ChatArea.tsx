import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { MessageItem } from './MessageItem';
import { Sparkles, MessageCircleHeart, Heart, Gift } from 'lucide-react';

interface ChatAreaProps {
  messages: ChatMessage[];
  isTyping: boolean;
  characterName: string;
  characterAvatar: string;
  onStarterClick: (starterText: string) => void;
  onRetryMessage: (message: ChatMessage) => void;
  onImageClick: (imageUrl: string) => void;
  isAdLocked?: boolean;
  onClaimAd?: () => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  isTyping,
  characterName,
  characterAvatar,
  onStarterClick,
  onRetryMessage,
  onImageClick,
  isAdLocked = false,
  onClaimAd,
}) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll on new message or when typing state changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const starterPrompts = [
    `Hey ${characterName}! Kaisi ho? ✨`,
    `Aaj kya chal raha hai? 💭`,
    `Kuch interesting batao na 🌸`,
    `Chalo thodi baatein karte hain 💕`,
  ];

  return (
    <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 relative select-none bg-gradient-to-b from-[#240529] via-[#320839] to-[#17021b] text-white">
      {/* Floating Bokeh Hearts Background Overlay (Exact Reference Theme) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-35 z-0">
        <div className="absolute top-[8%] left-[12%] text-pink-500/25 blur-[1px]">
          <Heart className="w-24 h-24 fill-current rotate-[-12deg]" />
        </div>
        <div className="absolute top-[28%] right-[8%] text-purple-400/20 blur-[2px]">
          <Heart className="w-32 h-32 fill-current rotate-[18deg]" />
        </div>
        <div className="absolute top-[52%] left-[6%] text-pink-600/20 blur-[1px]">
          <Heart className="w-28 h-28 fill-current rotate-[8deg]" />
        </div>
        <div className="absolute top-[72%] right-[14%] text-pink-500/25 blur-[1px]">
          <Heart className="w-20 h-20 fill-current rotate-[-15deg]" />
        </div>
        <div className="absolute bottom-[8%] left-[22%] text-purple-500/20 blur-[2px]">
          <Heart className="w-36 h-36 fill-current rotate-[5deg]" />
        </div>
      </div>

      <div className="relative z-10 flex flex-col min-h-full">
        {/* Date badge */}
        <div className="flex justify-center my-2 sticky top-1 z-10 pointer-events-none">
          <span className="text-[11px] font-medium px-3 py-1 rounded-full uppercase tracking-wider border shadow-xs backdrop-blur-md bg-purple-950/70 border-purple-800/40 text-pink-200">
            Today
          </span>
        </div>

        {/* Empty State */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-6 px-4 text-center my-auto">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-pink-500/80 shadow-[0_0_25px_rgba(255,42,133,0.35)] mb-3 relative group">
              <img
                src={characterAvatar}
                alt={characterName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-pink-500/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <MessageCircleHeart className="w-7 h-7 text-white drop-shadow" />
              </div>
            </div>

            <h2 className="text-lg font-bold text-white flex items-center gap-1.5">
              <span>Chat with {characterName}</span>
            </h2>
            <p className="text-xs max-w-xs mt-1 mb-6 text-pink-200/80">
              Say hello or tap any starter:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-md">
              {starterPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => onStarterClick(prompt)}
                  className="text-left text-xs px-3.5 py-2.5 rounded-2xl border shadow-xs transition-all flex items-center gap-2 group active:scale-95 bg-purple-900/40 hover:bg-purple-900/70 border-purple-700/50 text-pink-100 hover:border-pink-500/60 backdrop-blur-md"
                >
                  <Sparkles className="w-3.5 h-3.5 group-hover:scale-110 transition-transform flex-shrink-0 text-pink-400" />
                  <span className="truncate">{prompt}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message list */}
        <div className="space-y-1 flex-1">
          {messages.map((msg) => (
            <MessageItem
              key={msg.id}
              message={msg}
              characterAvatar={characterAvatar}
              onRetry={onRetryMessage}
              onImageClick={onImageClick}
            />
          ))}
        </div>

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-end gap-1.5 w-full mb-2 justify-start">
            <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 mb-1 border border-pink-500/50">
              <img
                src={characterAvatar}
                alt={characterName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="rounded-2xl rounded-tl-xs px-4 py-2.5 shadow-sm flex items-center gap-1.5 bg-[#4e1a5b] border border-purple-700/40">
              <span className="w-2 h-2 rounded-full bg-pink-400 animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 rounded-full bg-pink-400 animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 rounded-full bg-pink-400 animate-bounce"></span>
            </div>
          </div>
        )}

        {/* In-Chat Adsterra Claim Card (Appears only when limit reached, vanishes on claim) */}
        {isAdLocked && (
          <div className="my-4 mx-auto max-w-sm rounded-2xl bg-gradient-to-br from-[#3b0b45] to-[#26052c] border border-pink-500/40 p-4 text-center shadow-xl backdrop-blur-md animate-fadeIn">
            <div className="w-10 h-10 mx-auto mb-2.5 rounded-full bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-300">
              <Gift className="w-5 h-5 text-pink-400" />
            </div>
            <p className="text-sm font-bold text-white mb-1">
              Free Messages Limit Reached 💕
            </p>
            <p className="text-xs text-pink-200/90 mb-3.5 leading-relaxed">
              Agle 1 ghante tak continue chat karne ke liye ad dekhein!
            </p>
            <button
              onClick={onClaimAd}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold text-xs shadow-md shadow-pink-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
              <span>Watch Ad & Claim 1 Hour Chat 🎁</span>
            </button>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={bottomRef} className="h-1" />
      </div>
    </div>
  );
};
