import { ChatMessage, AppSettings } from '../types';
import { CHARACTER_NAME, CHARACTER_IMAGE } from '../config/character';

const MESSAGES_KEY = 'nomiya_companion_messages_v2';
const SETTINGS_KEY = 'nomiya_companion_settings_v2';

export const DEFAULT_SETTINGS: AppSettings = {
  characterName: CHARACTER_NAME,
  characterAvatar: CHARACTER_IMAGE,
  soundEnabled: true,
  typingAnimationEnabled: true,
  wallpaperTheme: 'romantic',
  fontSize: 'medium',
};

export const storageService = {
  getMessages(): ChatMessage[] {
    try {
      // Check v2 key first, then fallback to v1 if present
      let data = localStorage.getItem(MESSAGES_KEY);
      if (!data) {
        data = localStorage.getItem('aria_companion_messages_v1');
      }
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to read messages from localStorage', e);
      return [];
    }
  },

  saveMessages(messages: ChatMessage[]): void {
    try {
      // Keep up to 100 recent messages
      // Strip large base64 strings from older messages to protect localStorage quota (5MB limit)
      const trimmed = messages.slice(-100).map((msg, index, arr) => {
        // If it's not among the last 2 messages and has a massive base64, keep only imageUrl for display
        if (index < arr.length - 2 && msg.imageBase64 && msg.imageBase64.length > 5000) {
          return {
            ...msg,
            imageBase64: undefined, // free up storage
          };
        }
        return msg;
      });

      localStorage.setItem(MESSAGES_KEY, JSON.stringify(trimmed));
    } catch (e) {
      console.warn('localStorage save warning (quota exceeded or private mode):', e);
      // If quota exceeded, try saving just the last 20 messages without heavy base64
      try {
        const minimal = messages.slice(-20).map((m) => ({
          ...m,
          imageBase64: undefined,
        }));
        localStorage.setItem(MESSAGES_KEY, JSON.stringify(minimal));
      } catch {}
    }
  },

  clearMessages(): void {
    try {
      localStorage.removeItem(MESSAGES_KEY);
      localStorage.removeItem('aria_companion_messages_v1');
    } catch (e) {
      console.error('Failed to clear messages from localStorage', e);
    }
  },

  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      if (!data) return DEFAULT_SETTINGS;
      const parsed = JSON.parse(data);
      // Ensure we use Nomiya name & avatar if user hasn't explicitly set a custom one
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        characterName:
          !parsed.characterName || parsed.characterName === 'Aria'
            ? CHARACTER_NAME
            : parsed.characterName,
        characterAvatar: CHARACTER_IMAGE,
        wallpaperTheme: 'romantic',
      };
    } catch (e) {
      console.error('Failed to read settings from localStorage', e);
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings to localStorage', e);
    }
  },

  getUserMessageCount(): number {
    try {
      const val = localStorage.getItem('nomiya_user_msg_count_v1');
      return val ? parseInt(val, 10) || 0 : 0;
    } catch {
      return 0;
    }
  },

  incrementUserMessageCount(): number {
    try {
      const current = this.getUserMessageCount() + 1;
      localStorage.setItem('nomiya_user_msg_count_v1', current.toString());
      return current;
    } catch {
      return 1;
    }
  },
};
