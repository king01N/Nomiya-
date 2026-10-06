import React from 'react';
import { Trash2, User, Settings, ShieldCheck } from 'lucide-react';

interface ThreeDotMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenClearChat: () => void;
  onOpenCharacterInfo: () => void;
  onOpenSettings: () => void;
}

export const ThreeDotMenu: React.FC<ThreeDotMenuProps> = ({
  isOpen,
  onClose,
  onOpenClearChat,
  onOpenCharacterInfo,
  onOpenSettings,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-transparent"
        onClick={onClose}
      />

      {/* Popover Menu */}
      <div className="absolute right-2 top-14 z-50 w-52 bg-white rounded-2xl shadow-2xl border border-neutral-100 py-1.5 animate-in fade-in zoom-in-95 duration-100 text-[#111b21]">
        <button
          onClick={() => {
            onClose();
            onOpenCharacterInfo();
          }}
          className="w-full px-4 py-2.5 text-left text-sm hover:bg-neutral-100 active:bg-neutral-200 flex items-center gap-3 transition-colors"
        >
          <User className="w-4 h-4 text-emerald-700" />
          <span className="font-medium">Character Info</span>
        </button>

        <button
          onClick={() => {
            onClose();
            onOpenSettings();
          }}
          className="w-full px-4 py-2.5 text-left text-sm hover:bg-neutral-100 active:bg-neutral-200 flex items-center gap-3 transition-colors"
        >
          <Settings className="w-4 h-4 text-neutral-600" />
          <span className="font-medium">Settings</span>
        </button>

        <div className="h-px bg-neutral-100 my-1"></div>

        <button
          onClick={() => {
            onClose();
            onOpenClearChat();
          }}
          className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 active:bg-red-100 text-red-600 flex items-center gap-3 transition-colors"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
          <span className="font-medium">Clear Chat</span>
        </button>
      </div>
    </>
  );
};
