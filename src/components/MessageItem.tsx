import React from 'react';
import { Check, CheckCheck, Clock, AlertCircle } from 'lucide-react';
import { ChatMessage } from '../types';

interface MessageItemProps {
  message: ChatMessage;
  characterAvatar?: string;
  onRetry?: (message: ChatMessage) => void;
  onImageClick?: (imageUrl: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  characterAvatar,
  onRetry,
  onImageClick,
}) => {
  const isUser = message.sender === 'user';

  // Format time (e.g. "08:24 am")
  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  // Render status icon for user messages
  const renderStatus = () => {
    if (!isUser) return null;

    switch (message.status) {
      case 'sending':
        return <Clock className="w-3 h-3 inline ml-1 text-pink-200/70" />;
      case 'sent':
        return <Check className="w-3.5 h-3.5 inline ml-1 text-pink-100" />;
      case 'delivered':
        return <CheckCheck className="w-3.5 h-3.5 inline ml-1 text-pink-100" />;
      case 'read':
        return <CheckCheck className="w-3.5 h-3.5 inline ml-1 text-white drop-shadow" />;
      case 'error':
        return (
          <button
            onClick={() => onRetry && onRetry(message)}
            className="text-red-400 inline-flex items-center ml-1"
            title="Retry sending"
          >
            <AlertCircle className="w-3.5 h-3.5" />
          </button>
        );
      default:
        return <CheckCheck className="w-3.5 h-3.5 inline ml-1 text-white" />;
    }
  };

  // Sticker Message Rendering
  if (message.isSticker) {
    return (
      <div
        className={`flex w-full mb-2 ${
          isUser ? 'justify-end' : 'justify-start'
        }`}
      >
        <div className="flex flex-col items-end">
          <div className="text-6xl p-2 select-none hover:scale-110 active:scale-95 transition-transform duration-200">
            {message.stickerEmoji}
          </div>
          <div className="flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full shadow-xs bg-purple-900/60 backdrop-blur-md text-pink-200 border border-purple-700/40">
            <span>{formattedTime}</span>
            {renderStatus()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-end gap-1.5 w-full mb-2 ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      {/* Circular Avatar thumbnail beside left messages (matching reference screenshot) */}
      {!isUser && characterAvatar && (
        <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 mb-1 border border-pink-500/50 shadow-xs">
          <img
            src={characterAvatar}
            alt="Nomiya"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div
        className={`relative max-w-[85%] sm:max-w-[75%] md:max-w-[65%] px-3.5 py-2 ${
          isUser
            ? 'bg-gradient-to-r from-[#ff2a85] to-[#f41872] text-white shadow-[0_2px_8px_rgba(255,42,133,0.35)] rounded-2xl rounded-tr-xs'
            : 'bg-[#4e1a5b] text-white shadow-[0_1px_4px_rgba(0,0,0,0.25)] border border-purple-700/30 rounded-2xl rounded-tl-xs'
        }`}
      >
        {/* Attached image if present */}
        {message.imageUrl && (
          <div className="mb-1.5 overflow-hidden rounded-xl bg-black/20 cursor-pointer">
            <img
              src={message.imageUrl}
              alt="Shared upload"
              className="w-full max-h-72 object-cover rounded-xl hover:opacity-95 transition-opacity"
              onClick={() => onImageClick && onImageClick(message.imageUrl!)}
            />
          </div>
        )}

        {/* Message text */}
        {message.text && (
          <p className="text-[14.5px] leading-[1.38] select-text break-words whitespace-pre-wrap font-normal">
            {message.text}
          </p>
        )}

        {/* Error notice if message failed */}
        {message.status === 'error' && (
          <p className="text-xs text-red-300 mt-1 flex items-center gap-1 font-medium">
            <span>Failed to send. Tap to retry.</span>
          </p>
        )}

        {/* Timestamp & Status checks */}
        <div
          className={`flex items-center justify-end gap-1 mt-0.5 ml-3 float-right select-none text-[11px] ${
            isUser ? 'text-pink-100/90' : 'text-purple-200/70'
          }`}
        >
          <span>{formattedTime}</span>
          {renderStatus()}
        </div>
      </div>
    </div>
  );
};
