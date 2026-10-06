import React, { useState } from 'react';
import { X, Volume2, Sparkles, Trash2, Check, User } from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onOpenClearChat: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onOpenClearChat,
}) => {
  const [characterName, setCharacterName] = useState(settings.characterName);
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled);
  const [typingAnimationEnabled, setTypingAnimationEnabled] = useState(
    settings.typingAnimationEnabled
  );
  const [isSavedToast, setIsSavedToast] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings({
      ...settings,
      characterName: characterName.trim() || 'Nomiya 🦋',
      soundEnabled,
      typingAnimationEnabled,
      wallpaperTheme: 'romantic',
    });
    setIsSavedToast(true);
    setTimeout(() => {
      setIsSavedToast(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150 select-none">
      <div className="bg-[#26052c] border border-purple-900/50 text-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-purple-900/40">
          <h2 className="font-bold text-lg text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-pink-300 hover:text-white hover:bg-purple-900/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Character Name Edit */}
          <div>
            <label className="block text-xs font-semibold text-pink-300/80 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              Name
            </label>
            <input
              type="text"
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
              placeholder="Nomiya 🦋"
              maxLength={25}
              className="w-full bg-[#35083e] border border-purple-800/60 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-pink-300/40 outline-none focus:border-pink-500 transition-colors"
            />
          </div>

          {/* Audio Chimes Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-[#35083e] rounded-2xl border border-purple-800/40">
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-pink-400" />
              <div>
                <p className="text-sm font-semibold text-white">Message Sounds</p>
                <p className="text-[11px] text-pink-300/70">
                  Play tone on message send & receive
                </p>
              </div>
            </div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                soundEnabled ? 'bg-gradient-to-r from-pink-500 to-rose-500' : 'bg-purple-950'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  soundEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Typing Animation Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-[#35083e] rounded-2xl border border-purple-800/40">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <div>
                <p className="text-sm font-semibold text-white">Typing Indicator</p>
                <p className="text-[11px] text-pink-300/70">
                  Show animated dots while typing
                </p>
              </div>
            </div>
            <button
              onClick={() => setTypingAnimationEnabled(!typingAnimationEnabled)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                typingAnimationEnabled
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500'
                  : 'bg-purple-950'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  typingAnimationEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Clear Conversation Action */}
          <div className="pt-1">
            <button
              onClick={() => {
                onClose();
                onOpenClearChat();
              }}
              className="w-full py-2.5 px-4 bg-red-950/40 hover:bg-red-900/50 border border-red-800/50 rounded-2xl text-xs font-semibold text-red-300 flex items-center justify-center gap-2 transition-colors active:scale-98"
            >
              <Trash2 className="w-4 h-4" />
              Clear Conversation History
            </button>
          </div>

          {/* Clean About Note */}
          <div className="text-center text-[11px] text-pink-300/50 pt-2 border-t border-purple-900/40">
            <p>Private & secure conversation with {characterName}</p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-[#1f0324] border-t border-purple-900/40 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-pink-200 hover:bg-purple-900/40 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#ff2a85] to-[#f41872] text-white shadow-md active:scale-95 transition-transform flex items-center gap-1.5"
          >
            {isSavedToast ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Saved!
              </>
            ) : (
              'Save'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
