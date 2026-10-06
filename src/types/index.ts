export type MessageSender = 'user' | 'ai';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'error';

export interface ChatMessage {
  id: string;
  sender: MessageSender;
  text: string;
  timestamp: number;
  status: MessageStatus;
  imageUrl?: string;
  imageBase64?: string;
  imageMimeType?: string;
  isSticker?: boolean;
  stickerEmoji?: string;
  errorMessage?: string;
}

export interface AppSettings {
  characterName: string;
  characterAvatar: string;
  soundEnabled: boolean;
  typingAnimationEnabled: boolean;
  wallpaperTheme: 'romantic' | 'classic' | 'dark' | 'mint' | 'doodle';
  fontSize: 'small' | 'medium' | 'large';
}

export interface StickerItem {
  id: string;
  emoji: string;
  label: string;
  category: 'emotions' | 'cute' | 'reactions' | 'vibes';
}
