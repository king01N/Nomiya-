import React, { useRef, useEffect } from 'react';
import {
  Smile,
  Paperclip,
  Camera,
  Mic,
  Send,
  Square,
  Loader2,
  Gift,
} from 'lucide-react';

interface ComposerProps {
  text: string;
  onChangeText: (text: string) => void;
  onSendText: () => void;
  onOpenStickers: () => void;
  onOpenAttachment: () => void;
  onOpenCamera: () => void;
  onToggleVoiceInput: () => void;
  isListening: boolean;
  disabled?: boolean;
  isAdLocked?: boolean;
  onClaimAd?: () => void;
}

export const Composer: React.FC<ComposerProps> = ({
  text,
  onChangeText,
  onSendText,
  onOpenStickers,
  onOpenAttachment,
  onOpenCamera,
  onToggleVoiceInput,
  isListening,
  disabled = false,
  isAdLocked = false,
  onClaimAd,
}) => {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-resize textarea height up to max
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(
        inputRef.current.scrollHeight,
        120
      )}px`;
    }
  }, [text]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isAdLocked) {
        onClaimAd?.();
        return;
      }
      if (text.trim() && !disabled) {
        onSendText();
      }
    }
  };

  const hasContent = text.trim().length > 0;

  return (
    <footer className="sticky bottom-0 z-20 px-2.5 py-2 border-t flex items-end gap-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] bg-[#1e0322] border-purple-950/70">
      {/* Listening Banner if currently recording speech */}
      {isListening ? (
        <div className="flex-1 flex items-center justify-between rounded-2xl px-4 py-2 text-xs shadow-xs animate-pulse border bg-purple-900/60 border-pink-500/50 text-pink-200">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-pink-500 animate-ping"></span>
            <span className="font-semibold">Listening... Speak now</span>
          </div>
          <button
            onClick={onToggleVoiceInput}
            className="text-xs px-2.5 py-1 rounded-full font-medium active:scale-95 transition-transform bg-pink-600 text-white"
          >
            Done
          </button>
        </div>
      ) : isAdLocked ? (
        /* Locked Bar - Click to Claim */
        <div
          onClick={onClaimAd}
          className="flex-1 flex items-center justify-between rounded-3xl px-4 py-2.5 shadow-sm bg-gradient-to-r from-[#3b0b45] to-[#2a0531] border border-pink-500/50 cursor-pointer active:scale-[0.99] transition-transform"
        >
          <div className="flex items-center gap-2 text-xs text-pink-200 truncate">
            <Gift className="w-4 h-4 text-pink-400 flex-shrink-0 animate-bounce" />
            <span className="font-medium">Ad dekh kar 1 ghanta chat unlock karein</span>
          </div>
          <span className="text-[11px] font-bold text-pink-400 bg-pink-500/20 px-2 py-0.5 rounded-full flex-shrink-0">
            Claim 🎁
          </span>
        </div>
      ) : (
        /* Main Input Capsule */
        <div className="flex-1 flex items-end rounded-3xl px-2 py-1 shadow-sm bg-[#310839] border border-purple-800/40 focus-within:border-pink-500/80 focus-within:shadow-[0_0_12px_rgba(255,42,133,0.2)]">
          {/* Sticker / Emoji button */}
          <button
            onClick={onOpenStickers}
            className="p-2 active:scale-90 transition-transform rounded-full flex-shrink-0 text-pink-300 hover:text-pink-100 cursor-pointer"
            title="Stickers & Emojis"
            type="button"
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Text Area */}
          <textarea
            ref={inputRef}
            rows={1}
            value={text}
            onChange={(e) => onChangeText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message"
            className="flex-1 bg-transparent px-2 py-2 text-[15px] leading-5 resize-none outline-none max-h-28 overflow-y-auto text-white placeholder-pink-300/40"
          />

          {/* Attachment button */}
          <button
            onClick={onOpenAttachment}
            className="p-2 active:scale-90 transition-transform rounded-full flex-shrink-0 text-pink-300 hover:text-pink-100 cursor-pointer"
            title="Attach photo"
            type="button"
          >
            <Paperclip className="w-5 h-5 -rotate-45" />
          </button>

          {/* Camera button */}
          {!hasContent && (
            <button
              onClick={onOpenCamera}
              className="p-2 active:scale-90 transition-transform rounded-full flex-shrink-0 text-pink-300 hover:text-pink-100 cursor-pointer"
              title="Camera"
              type="button"
            >
              <Camera className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      {/* Floating Action Button (Mic or Send or Gift Claim) */}
      {isAdLocked ? (
        <button
          onClick={onClaimAd}
          className="w-11 h-11 flex-shrink-0 rounded-full text-white flex items-center justify-center shadow-md transition-all active:scale-95 bg-gradient-to-r from-pink-500 to-rose-500 shadow-[0_0_15px_rgba(255,42,133,0.4)] cursor-pointer"
          title="Watch Ad & Claim 1 Hour Chat"
          type="button"
        >
          <Gift className="w-5 h-5" />
        </button>
      ) : hasContent ? (
        <button
          onClick={onSendText}
          disabled={disabled || !text.trim()}
          className="w-11 h-11 flex-shrink-0 rounded-full text-white flex items-center justify-center shadow-md transition-all active:scale-95 disabled:opacity-70 bg-gradient-to-r from-[#ff2a85] to-[#f41872] shadow-[0_0_15px_rgba(255,42,133,0.4)] cursor-pointer"
          title="Send message"
          type="button"
        >
          {disabled ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5 ml-0.5" />
          )}
        </button>
      ) : (
        <button
          onClick={onToggleVoiceInput}
          className={`w-11 h-11 flex-shrink-0 rounded-full text-white flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer ${
            isListening
              ? 'bg-pink-600 animate-pulse shadow-[0_0_15px_rgba(236,72,153,0.5)]'
              : 'bg-gradient-to-r from-[#ff2a85] to-[#f41872] shadow-[0_0_12px_rgba(255,42,133,0.35)]'
          }`}
          title={isListening ? 'Stop voice recording' : 'Voice message'}
          type="button"
        >
          {isListening ? (
            <Square className="w-5 h-5 fill-current" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </button>
      )}
    </footer>
  );
};
