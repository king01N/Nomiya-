import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { ChatArea } from './components/ChatArea';
import { Composer } from './components/Composer';
import { ThreeDotMenu } from './components/ThreeDotMenu';
import { ClearChatModal } from './components/ClearChatModal';
import { CharacterInfoModal } from './components/CharacterInfoModal';
import { SettingsModal } from './components/SettingsModal';
import { StickerPicker } from './components/StickerPicker';
import { AttachmentPicker } from './components/AttachmentPicker';
import { CameraCaptureModal } from './components/CameraCaptureModal';
import { ImagePreviewModal } from './components/ImagePreviewModal';
import { ImageViewerModal } from './components/ImageViewerModal';

import { geminiService } from './services/geminiService';
import { voiceService } from './services/voiceService';
import { soundService } from './services/soundService';
import { storageService } from './services/storage';

import { ChatMessage, AppSettings, StickerItem } from './types';
import { Clock } from 'lucide-react';

export const App: React.FC = () => {
  // 1. Core State
  const [settings, setSettings] = useState<AppSettings>(() =>
    storageService.getSettings()
  );
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    storageService.getMessages()
  );
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 2. Modals & Drawers State
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isClearChatOpen, setIsClearChatOpen] = useState(false);
  const [isCharacterInfoOpen, setIsCharacterInfoOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStickersOpen, setIsStickersOpen] = useState(false);
  const [isAttachmentOpen, setIsAttachmentOpen] = useState(false);
  const [isCameraCaptureOpen, setIsCameraCaptureOpen] = useState(false);
  const [activePreviewImage, setActivePreviewImage] = useState<string | null>(null);
  const [activeFullImage, setActiveFullImage] = useState<string | null>(null);
  const [pendingFeatureNotice, setPendingFeatureNotice] = useState<string | null>(null);

  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  // Track consecutive unreplied proactive messages (max 3, then stops completely)
  const consecutiveNudgeCountRef = useRef<number>(0);
  // Safeguard: prevents Nomiya from skipping replies consecutively
  const hasSkippedLastReplyRef = useRef<boolean>(false);

  // Sync messages to localStorage
  useEffect(() => {
    storageService.saveMessages(messages);
  }, [messages]);

  // Sync settings to localStorage
  useEffect(() => {
    storageService.saveSettings(settings);
  }, [settings]);

  // Dismiss toast error automatically
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // Auto-dismiss pending notice after 3.5s
  useEffect(() => {
    if (pendingFeatureNotice) {
      const timer = setTimeout(() => setPendingFeatureNotice(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [pendingFeatureNotice]);

  // Proactive Idle Message by Nomiya:
  // Sends maximum 2 to 3 messages if user is inactive. If user still doesn't reply, stops completely!
  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    // If Nomiya has already sent 3 unreplied nudges, STOP completely until user replies
    if (consecutiveNudgeCountRef.current >= 3) {
      return;
    }

    // Trigger after 45 seconds of user silence
    idleTimerRef.current = setTimeout(async () => {
      // Don't interrupt if currently typing or if limit already reached
      if (isTyping || consecutiveNudgeCountRef.current >= 3) return;

      const currentAttempt = consecutiveNudgeCountRef.current;

      // Realistic progressive messages:
      let ping = '';
      if (currentAttempt === 0) {
        const firstNudges = [
          'Suno na... kya kar rahe ho abhi? ✨',
          'Kahan gayab ho gaye? 🥺',
          'Arey busy ho kya thode? 🌸',
          'Online ho na? Kuch bolte kyu nahi? 😊',
        ];
        ping = firstNudges[Math.floor(Math.random() * firstNudges.length)];
      } else if (currentAttempt === 1) {
        const secondNudges = [
          'Online ho fir bhi reply nahi kar rahe? 😜',
          'Lagta hai aaj bohot busy chal rahe ho 🙈',
          'Itna kya soch rahe ho? Ek chota sa text toh bhej do 💕',
        ];
        ping = secondNudges[Math.floor(Math.random() * secondNudges.length)];
      } else {
        // 3rd & Final message before stopping
        const finalNudges = [
          'Chalo theek hai, jab free ho jao tab message karna, main yahi hoon 💕',
          'Lagta hai koi zaroori kaam hai. Free hoke aaram se message karna! 🌸✨',
          'Theek hai, main wait karungi, jab man kare tab text karna 😊🦋',
        ];
        ping = finalNudges[Math.floor(Math.random() * finalNudges.length)];
      }

      // Increment count
      consecutiveNudgeCountRef.current += 1;

      if (settings.typingAnimationEnabled) {
        setIsTyping(true);
      }
      await new Promise((r) => setTimeout(r, 950));

      const aiMessage: ChatMessage = {
        id: `ai-proactive-${Date.now()}`,
        sender: 'ai',
        text: ping,
        timestamp: Date.now(),
        status: 'read',
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
      if (settings.soundEnabled) {
        soundService.playReceiveSound();
      }
    }, 45000);
  }, [isTyping, settings]);

  // Initialize and cleanup idle timer
  useEffect(() => {
    resetIdleTimer();
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [messages.length, resetIdleTimer]);

  // Call click handler - Pending in app notice
  const handlePendingCallClick = () => {
    setPendingFeatureNotice('This feature is pending in app');
  };

  // Helper to deliver Nomiya's multi-bubble messages sequentially
  const deliverAiBubbles = async (
    bubbles: string[],
    imageUrl?: string,
    replyText?: string
  ) => {
    // 1. If photo was requested, deliver photo bubble
    if (imageUrl) {
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: replyText || '',
        imageUrl,
        timestamp: Date.now(),
        status: 'read',
      };
      setMessages((prev) => [...prev, aiMessage]);
      if (settings.soundEnabled) soundService.playReceiveSound();
      return;
    }

    const cleanBubbles = bubbles.filter((b) => Boolean(b && b.trim()));
    if (cleanBubbles.length === 0) return;

    // 2. Deliver bubbles one by one with realistic pauses and typing indicators
    for (let i = 0; i < cleanBubbles.length; i++) {
      if (i > 0) {
        if (settings.typingAnimationEnabled) {
          setIsTyping(true);
        }
        const delay = Math.min(850, Math.max(450, cleanBubbles[i].length * 35));
        await new Promise((r) => setTimeout(r, delay));
      }

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}-${i}`,
        sender: 'ai',
        text: cleanBubbles[i],
        timestamp: Date.now(),
        status: 'read',
      };

      setMessages((prev) => [...prev, aiMessage]);
      if (settings.soundEnabled) {
        soundService.playReceiveSound();
      }
    }
  };

  // Send Text Message
  const handleSendMessage = useCallback(
    async (textToSend?: string) => {
      const text = (textToSend || inputText).trim();
      if (!text || isTyping) return;

      // User replied, reset consecutive proactive nudge counter to 0!
      consecutiveNudgeCountRef.current = 0;
      resetIdleTimer();

      const userMsgId = `user-${Date.now()}`;
      const userMessage: ChatMessage = {
        id: userMsgId,
        sender: 'user',
        text,
        timestamp: Date.now(),
        status: 'sent',
      };

      // Add user message
      setMessages((prev) => [...prev, userMessage]);
      setInputText('');
      if (settings.soundEnabled) {
        soundService.playSendSound();
      }

      if (settings.typingAnimationEnabled) {
        setIsTyping(true);
      }

      const messageCount = storageService.incrementUserMessageCount();

      try {
        const { reply, bubbles, imageUrl, skipped } = await geminiService.sendMessage({
          history: messages,
          userText: text,
          characterName: settings.characterName,
          messageCount,
          allowSkip: !hasSkippedLastReplyRef.current,
        });

        // Mark user message as read
        setMessages((prev) =>
          prev.map((m) =>
            m.id === userMsgId ? { ...m, status: 'read' as const } : m
          )
        );

        // If Nomiya was momentarily distracted / didn't reply this turn (0 messages)
        if (skipped || (bubbles.length === 0 && !imageUrl)) {
          hasSkippedLastReplyRef.current = true;
          setIsTyping(false);
          resetIdleTimer();
          return;
        }

        // Replied normally! Reset skip safeguard so consecutive skips never happen
        hasSkippedLastReplyRef.current = false;

        // Deliver multi-bubble responses (1, 2, or 3 bubbles)
        await deliverAiBubbles(bubbles, imageUrl, reply);
      } catch (err: any) {
        console.error('Error generating reply:', err);
        setErrorMessage(
          err?.message || 'Could not send message. Please try again.'
        );
        // Mark user message with error status
        setMessages((prev) =>
          prev.map((m) =>
            m.id === userMsgId ? { ...m, status: 'error' as const } : m
          )
        );
      } finally {
        setIsTyping(false);
      }
    },
    [inputText, isTyping, messages, settings, resetIdleTimer]
  );

  // Send Image Message
  const handleSendImage = async (caption: string) => {
    if (!activePreviewImage) return;

    consecutiveNudgeCountRef.current = 0;
    resetIdleTimer();
    const imageBase64 = activePreviewImage;
    const userMsgId = `img-${Date.now()}`;

    const userMessage: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: caption,
      imageUrl: imageBase64,
      imageBase64,
      imageMimeType: 'image/jpeg',
      timestamp: Date.now(),
      status: 'sent',
    };

    setMessages((prev) => [...prev, userMessage]);
    setActivePreviewImage(null);

    if (settings.soundEnabled) {
      soundService.playSendSound();
    }

    if (settings.typingAnimationEnabled) {
      setIsTyping(true);
    }

    const messageCount = storageService.incrementUserMessageCount();

    try {
      const { reply, bubbles, imageUrl, skipped } = await geminiService.sendMessage({
        history: messages,
        userText: caption,
        imageBase64,
        imageMimeType: 'image/jpeg',
        characterName: settings.characterName,
        messageCount,
        allowSkip: !hasSkippedLastReplyRef.current,
      });

      setMessages((prev) =>
        prev.map((m) =>
          m.id === userMsgId ? { ...m, status: 'read' as const } : m
        )
      );

      if (skipped || (bubbles.length === 0 && !imageUrl)) {
        hasSkippedLastReplyRef.current = true;
        setIsTyping(false);
        resetIdleTimer();
        return;
      }

      hasSkippedLastReplyRef.current = false;
      await deliverAiBubbles(bubbles, imageUrl, reply);
    } catch (err: any) {
      console.error('Image chat error:', err);
      setErrorMessage(
        err?.message || 'Failed to process image.'
      );
      setMessages((prev) =>
        prev.map((m) =>
          m.id === userMsgId ? { ...m, status: 'error' as const } : m
        )
      );
    } finally {
      setIsTyping(false);
    }
  };

  // Send Sticker
  const handleSelectSticker = async (sticker: StickerItem) => {
    consecutiveNudgeCountRef.current = 0;
    resetIdleTimer();
    const userMsgId = `sticker-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: '',
      isSticker: true,
      stickerEmoji: sticker.emoji,
      timestamp: Date.now(),
      status: 'sent',
    };

    setMessages((prev) => [...prev, userMessage]);
    if (settings.soundEnabled) {
      soundService.playSendSound();
    }

    if (settings.typingAnimationEnabled) {
      setIsTyping(true);
    }

    const messageCount = storageService.incrementUserMessageCount();

    try {
      const { reply, bubbles, imageUrl, skipped } = await geminiService.sendMessage({
        history: messages,
        userText: `[Sent sticker: ${sticker.emoji} - ${sticker.label}]`,
        characterName: settings.characterName,
        messageCount,
        allowSkip: !hasSkippedLastReplyRef.current,
      });

      setMessages((prev) =>
        prev.map((m) =>
          m.id === userMsgId ? { ...m, status: 'read' as const } : m
        )
      );

      if (skipped || (bubbles.length === 0 && !imageUrl)) {
        hasSkippedLastReplyRef.current = true;
        setIsTyping(false);
        resetIdleTimer();
        return;
      }

      hasSkippedLastReplyRef.current = false;
      await deliverAiBubbles(bubbles, imageUrl, reply);
    } catch (err: any) {
      console.error('Sticker chat error:', err);
      setErrorMessage('Could not send sticker reaction.');
    } finally {
      setIsTyping(false);
    }
  };

  // Select File from Device Gallery
  const handleSelectImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setActivePreviewImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Retry Failed Message
  const handleRetryMessage = (failedMsg: ChatMessage) => {
    setMessages((prev) => prev.filter((m) => m.id !== failedMsg.id));
    if (failedMsg.imageUrl) {
      setActivePreviewImage(failedMsg.imageUrl);
    } else {
      handleSendMessage(failedMsg.text);
    }
  };

  // Speech to Text Microphone Toggle
  const handleToggleVoiceInput = () => {
    if (isListening) {
      voiceService.stopListening();
      setIsListening(false);
      return;
    }

    const started = voiceService.startListening(
      (transcript) => {
        setInputText(transcript);
      },
      (listening, err) => {
        setIsListening(listening);
        if (err) {
          setErrorMessage(err);
        }
      }
    );

    if (started) {
      setIsListening(true);
    }
  };

  // Clear Chat: deletes locally stored messages
  const handleConfirmClearChat = () => {
    storageService.clearMessages();
    setMessages([]);
    consecutiveNudgeCountRef.current = 0;
    hasSkippedLastReplyRef.current = false;
    setIsClearChatOpen(false);
    setIsMenuOpen(false);
  };

  return (
    <div className="flex justify-center bg-black min-h-screen text-white font-sans antialiased overflow-hidden">
      {/* Mobile container centered on desktop */}
      <div className="w-full max-w-2xl h-dvh flex flex-col bg-[#240529] shadow-2xl relative overflow-hidden">
        {/* Top App Bar with Call Buttons */}
        <Header
          characterName={settings.characterName}
          characterAvatar={settings.characterAvatar}
          isTyping={isTyping}
          onOpenVoiceCall={handlePendingCallClick}
          onOpenVideoCall={handlePendingCallClick}
          onOpenMenu={() => setIsMenuOpen(true)}
          onOpenCharacterInfo={() => setIsCharacterInfoOpen(true)}
        />

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="bg-red-500 text-white text-xs px-4 py-2 flex items-center justify-between shadow-md z-30 animate-in slide-in-from-top duration-150">
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-white font-bold ml-3 text-sm hover:opacity-80"
            >
              ✕
            </button>
          </div>
        )}

        {/* Pending Feature Toast */}
        {pendingFeatureNotice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 select-none">
            <div className="bg-[#2a0531] border border-pink-500/50 rounded-3xl p-6 max-w-xs w-full text-center shadow-2xl animate-in zoom-in-95 duration-200 text-white">
              <div className="w-14 h-14 rounded-full bg-pink-500/20 border border-pink-500/40 flex items-center justify-center mx-auto mb-3 text-pink-400">
                <Clock className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">
                Notice
              </h3>
              <p className="text-sm font-medium text-pink-200/90 leading-relaxed mb-5">
                {pendingFeatureNotice}
              </p>
              <button
                onClick={() => setPendingFeatureNotice(null)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#ff2a85] to-[#f41872] text-white text-xs font-semibold shadow-md active:scale-95 transition-transform"
              >
                Okay
              </button>
            </div>
          </div>
        )}

        {/* Chat Messages Area */}
        <ChatArea
          messages={messages}
          isTyping={isTyping}
          characterName={settings.characterName}
          characterAvatar={settings.characterAvatar}
          onStarterClick={(starter) => handleSendMessage(starter)}
          onRetryMessage={handleRetryMessage}
          onImageClick={(url) => setActiveFullImage(url)}
        />

        {/* Bottom Composer */}
        <Composer
          text={inputText}
          onChangeText={setInputText}
          onSendText={() => handleSendMessage()}
          onOpenStickers={() => setIsStickersOpen(true)}
          onOpenAttachment={() => setIsAttachmentOpen(true)}
          onOpenCamera={() => setIsCameraCaptureOpen(true)}
          onToggleVoiceInput={handleToggleVoiceInput}
          isListening={isListening}
          disabled={isTyping}
        />

        {/* Three-Dot Menu */}
        <ThreeDotMenu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          onOpenClearChat={() => setIsClearChatOpen(true)}
          onOpenCharacterInfo={() => setIsCharacterInfoOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Stickers & Emojis Picker Drawer */}
        <StickerPicker
          isOpen={isStickersOpen}
          onClose={() => setIsStickersOpen(false)}
          onSelectSticker={handleSelectSticker}
        />

        {/* File / Photo Attachment Bottom Sheet */}
        <AttachmentPicker
          isOpen={isAttachmentOpen}
          onClose={() => setIsAttachmentOpen(false)}
          onSelectImageFile={handleSelectImageFile}
          onOpenCameraCapture={() => setIsCameraCaptureOpen(true)}
        />

        {/* Live Camera Capture Modal */}
        <CameraCaptureModal
          isOpen={isCameraCaptureOpen}
          onClose={() => setIsCameraCaptureOpen(false)}
          onCapture={(dataUrl) => setActivePreviewImage(dataUrl)}
        />

        {/* Image Preview & Caption Modal */}
        <ImagePreviewModal
          isOpen={Boolean(activePreviewImage)}
          imageSrc={activePreviewImage}
          onClose={() => setActivePreviewImage(null)}
          onSend={handleSendImage}
          characterName={settings.characterName}
        />

        {/* Fullscreen Image Lightbox Viewer */}
        <ImageViewerModal
          isOpen={Boolean(activeFullImage)}
          imageUrl={activeFullImage}
          onClose={() => setActiveFullImage(null)}
        />

        {/* Clear Chat Confirmation Modal */}
        <ClearChatModal
          isOpen={isClearChatOpen}
          onClose={() => setIsClearChatOpen(false)}
          onConfirmClear={handleConfirmClearChat}
        />

        {/* Contact Info Drawer */}
        <CharacterInfoModal
          isOpen={isCharacterInfoOpen}
          onClose={() => setIsCharacterInfoOpen(false)}
          characterName={settings.characterName}
          characterAvatar={settings.characterAvatar}
          onStartVoiceCall={handlePendingCallClick}
          onStartVideoCall={handlePendingCallClick}
        />

        {/* App Settings Modal */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          onSaveSettings={(newSettings) => setSettings(newSettings)}
          onOpenClearChat={() => setIsClearChatOpen(true)}
        />
      </div>
    </div>
  );
};

export default App;
