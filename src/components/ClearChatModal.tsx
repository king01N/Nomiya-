import React from 'react';
import { Trash2 } from 'lucide-react';

interface ClearChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmClear: () => void;
}

export const ClearChatModal: React.FC<ClearChatModalProps> = ({
  isOpen,
  onClose,
  onConfirmClear,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-in fade-in duration-150">
      <div className="w-full max-w-xs bg-white rounded-3xl p-6 shadow-2xl border border-neutral-100 animate-in zoom-in-95 duration-150">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6" />
        </div>

        <h3 className="text-center font-bold text-neutral-900 text-base mb-1.5">
          Clear this conversation?
        </h3>
        <p className="text-center text-xs text-neutral-500 mb-6 leading-relaxed">
          This will permanently delete all messages in this chat from your device.
        </p>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              onConfirmClear();
              onClose();
            }}
            className="w-full py-2.5 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 text-white font-semibold text-sm transition-all shadow-sm"
          >
            Clear Chat
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-full bg-neutral-100 hover:bg-neutral-200 active:scale-95 text-neutral-700 font-medium text-sm transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
