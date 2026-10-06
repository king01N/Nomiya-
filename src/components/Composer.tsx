import React, { useRef, useEffect } from 'react';
import {
  Smile,
  Paperclip,
  Camera,
  Mic,
  Send,
  Square,
  Loader2,
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
      ) : (
        /* Main Input Capsule */
        <div className="flex-1 flex items-end rounded-3xl px-2 py-1 shadow-sm bg-[#310839] border border-purple-800/40 focus-within:border-pink-500/80 focus-within:shadow-[0_0_12px_rgba(255,42,133,0.2)]">
          {/* Sticker / Emoji button */}
          <button
            onClick={onOpenStickers}
            className="p-2 active:scale-90 transition-transform rounded-full flex-shrink-0 text-pink-300 hover:text-pink-100"
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
            className="p-2 active:scale-90 transition-transform rounded-full flex-shrink-0 text-pink-300 hover:text-pink-100"
            title="Attach photo"
            type="button"
          >
            <Paperclip className="w-5 h-5 -rotate-45" />
          </button>

          {/* Camera button */}
          {!hasContent && (
            <button
              onClick={onOpenCamera}
              className="p-2 active:scale-90 transition-transform rounded-full flex-shrink-0 text-pink-300 hover:text-pink-100"
              title="Camera"
              type="button"
            >
              <Camera className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      {/* Floating Action Button (Mic or Send) */}
      {hasContent ? (
        <button
          onClick={onSendText}
          disabled={disabled || !text.trim()}
          className="w-11 h-11 flex-shrink-0 rounded-full text-white flex items-center justify-center shadow-md transition-all active:scale-95 disabled:opacity-70 bg-gradient-to-r from-[#ff2a85] to-[#f41872] shadow-[0_0_15px_rgba(255,42,133,0.4)]"
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
          className={`w-11 h-11 flex-shrink-0 rounded-full text-white flex items-center justify-center shadow-md transition-all active:scale-95 ${
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
