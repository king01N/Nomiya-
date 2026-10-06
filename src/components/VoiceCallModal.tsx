import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, PhoneOff, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { voiceService } from '../services/voiceService';
import { geminiService } from '../services/geminiService';
import { ChatMessage } from '../types';

interface VoiceCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  characterName: string;
  characterAvatar: string;
  history: ChatMessage[];
  onAddMessage: (msg: ChatMessage) => void;
}

export const VoiceCallModal: React.FC<VoiceCallModalProps> = ({
  isOpen,
  onClose,
  characterName,
  characterAvatar,
  history,
  onAddMessage,
}) => {
  const [callStatus, setCallStatus] = useState<'calling' | 'connected'>('calling');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [subtitles, setSubtitles] = useState<string>('Calling...');

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const historyRef = useRef<ChatMessage[]>(history);
  historyRef.current = history;

  useEffect(() => {
    if (!isOpen) {
      cleanupCall();
      return;
    }

    setCallStatus('calling');
    setCallDuration(0);
    setSubtitles(`Calling ${characterName}...`);

    // Connect after 1.2s
    const connectTimer = setTimeout(() => {
      setCallStatus('connected');
      setSubtitles(`Connected`);

      handleCompanionGreeting();

      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }, 1200);

    return () => {
      clearTimeout(connectTimer);
      cleanupCall();
    };
  }, [isOpen]);

  const cleanupCall = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
    voiceService.stopListening();
    voiceService.stopSpeaking();
    setIsAiSpeaking(false);
    setIsUserSpeaking(false);
  };

  const handleCompanionGreeting = async () => {
    const greeting = `Haan bolo! Main sun rahi hoon, batao kya haal chaal?`;
    setIsAiSpeaking(true);
    setSubtitles(greeting);
    await voiceService.speakText(greeting);
    setIsAiSpeaking(false);
    startUserListeningLoop();
  };

  const startUserListeningLoop = () => {
    if (isMuted) return;

    voiceService.startListening(
      (transcript, isFinal) => {
        setIsUserSpeaking(true);
        setSubtitles(`You: "${transcript}"`);

        if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);

        if (isFinal && transcript.trim()) {
          handleUserSpeechTurn(transcript.trim());
        } else {
          speechTimeoutRef.current = setTimeout(() => {
            if (transcript.trim()) {
              handleUserSpeechTurn(transcript.trim());
            }
          }, 1600);
        }
      },
      (isListening, error) => {
        if (!isListening) {
          setIsUserSpeaking(false);
        }
        if (error) {
          console.warn('Voice error in call:', error);
        }
      }
    );
  };

  const handleUserSpeechTurn = async (userText: string) => {
    voiceService.stopListening();
    setIsUserSpeaking(false);

    const userMsg: ChatMessage = {
      id: `voice-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: Date.now(),
      status: 'read',
    };
    onAddMessage(userMsg);

    setSubtitles(`${characterName} is speaking...`);
    setIsAiSpeaking(true);

    try {
      const { reply, audioBase64 } = await geminiService.sendVoiceTurn(
        historyRef.current,
        userText,
        characterName
      );

      const aiMsg: ChatMessage = {
        id: `voice-ai-${Date.now()}`,
        sender: 'ai',
        text: reply,
        timestamp: Date.now(),
        status: 'read',
      };
      onAddMessage(aiMsg);

      setSubtitles(`${characterName}: "${reply}"`);
      await voiceService.speakText(reply, audioBase64);
    } catch (err: any) {
      console.error('Call response error:', err);
      const fallback = `Arey haan! Main sun rahi hoon, batao na aage!`;
      setSubtitles(fallback);
      await voiceService.speakText(fallback);
    } finally {
      setIsAiSpeaking(false);
      startUserListeningLoop();
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      startUserListeningLoop();
    } else {
      setIsMuted(true);
      voiceService.stopListening();
      setIsUserSpeaking(false);
      setSubtitles('Microphone muted');
    }
  };

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining
      .toString()
      .padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#19031c] flex flex-col justify-between p-6 animate-in fade-in duration-200 select-none">
      {/* Top Header */}
      <div className="text-center pt-8">
        <h2 className="text-2xl font-bold text-white tracking-wide">
          {characterName}
        </h2>
        <p className="text-sm font-medium mt-1">
          {callStatus === 'calling' ? (
            <span className="text-pink-400 animate-pulse">Calling...</span>
          ) : (
            <span className="text-pink-200/70">
              {formatDuration(callDuration)}
            </span>
          )}
        </p>
      </div>

      {/* Center Avatar with Acoustic Rings */}
      <div className="flex flex-col items-center justify-center my-auto">
        <div className="relative flex items-center justify-center">
          {(isAiSpeaking || isUserSpeaking) && (
            <div className="absolute w-56 h-56 rounded-full border-2 border-pink-400/40 animate-ping"></div>
          )}
          {isAiSpeaking && (
            <div className="absolute w-48 h-48 rounded-full bg-pink-500/15 animate-pulse"></div>
          )}

          <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-pink-500/80 shadow-[0_0_40px_rgba(255,42,133,0.35)] z-10">
            <img
              src={characterAvatar}
              alt={characterName}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Live Subtitle Transcript */}
        <div className="mt-8 px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md max-w-sm text-center border border-white/10">
          <p className="text-xs text-neutral-200 italic leading-relaxed">
            {subtitles}
          </p>
        </div>

        {/* Status indicator */}
        <div className="mt-3 flex items-center gap-2 text-[11px] font-medium text-pink-300">
          <Sparkles className="w-3 h-3 text-pink-400" />
          <span>
            {isAiSpeaking
              ? `${characterName} is speaking...`
              : isUserSpeaking
              ? 'Listening to you...'
              : 'Voice Call Active'}
          </span>
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div className="pb-8 flex items-center justify-center gap-6">
        {/* Mute Button */}
        <button
          onClick={toggleMute}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            isMuted
              ? 'bg-red-600 text-white shadow-lg'
              : 'bg-white/15 hover:bg-white/25 text-white backdrop-blur-md'
          }`}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>

        {/* End Call Button */}
        <button
          onClick={onClose}
          className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 text-white flex items-center justify-center shadow-2xl transition-transform"
          title="End Call"
        >
          <PhoneOff className="w-7 h-7" />
        </button>

        {/* Speaker Toggle */}
        <button
          onClick={() => setIsSpeakerOn(!isSpeakerOn)}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            isSpeakerOn
              ? 'bg-white/20 text-white'
              : 'bg-neutral-800 text-neutral-400'
          }`}
          title="Speaker"
        >
          {isSpeakerOn ? (
            <Volume2 className="w-6 h-6" />
          ) : (
            <VolumeX className="w-6 h-6" />
          )}
        </button>
      </div>
    </div>
  );
};
