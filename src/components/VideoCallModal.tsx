import React, { useState, useEffect, useRef } from 'react';
import {
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  characterName: string;
  characterAvatar: string;
}

export const VideoCallModal: React.FC<VideoCallModalProps> = ({
  isOpen,
  onClose,
  characterName,
  characterAvatar,
}) => {
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const userVideoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopUserCamera();
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setCallDuration(0);
    startUserCamera();

    timerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => {
      stopUserCamera();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, facingMode]);

  const startUserCamera = async () => {
    stopUserCamera();
    if (isCameraOff) return;

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        });
        streamRef.current = stream;
        if (userVideoRef.current) {
          userVideoRef.current.srcObject = stream;
          userVideoRef.current.play().catch(() => {});
        }
      }
    } catch (e) {
      console.warn('Video call camera access denied or unavailable:', e);
    }
  };

  const stopUserCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (userVideoRef.current) {
      userVideoRef.current.srcObject = null;
    }
  };

  const toggleCamera = () => {
    if (!isCameraOff) {
      stopUserCamera();
      setIsCameraOff(true);
    } else {
      setIsCameraOff(false);
      startUserCamera();
    }
  };

  const flipCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
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
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between overflow-hidden animate-in fade-in duration-200 select-none">
      {/* Background AI Companion Viewport */}
      <div className="absolute inset-0 z-0 flex items-center justify-center bg-radial from-neutral-800 to-neutral-950">
        <img
          src={characterAvatar}
          alt={characterName}
          className="w-full h-full object-cover opacity-70 filter blur-xs scale-105"
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-2xs" />

        {/* Center Companion Portrait Card */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden border-4 border-pink-500/80 shadow-[0_0_50px_rgba(255,42,133,0.4)]">
            <img
              src={characterAvatar}
              alt={characterName}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="mt-4 px-3 py-1 rounded-full bg-purple-950/80 border border-pink-500/40 text-pink-300 text-xs font-semibold flex items-center gap-1.5 shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            Connected
          </span>
        </div>
      </div>

      {/* Top Header Bar */}
      <div className="relative z-20 flex items-center justify-between p-5 text-white bg-gradient-to-b from-black/70 to-transparent">
        <div>
          <h3 className="font-bold text-lg leading-tight">{characterName}</h3>
          <p className="text-xs text-neutral-300">
            {formatDuration(callDuration)}
          </p>
        </div>
      </div>

      {/* Picture-in-Picture: User Camera Preview (Top Right) */}
      <div className="absolute top-5 right-5 z-20 w-28 h-40 sm:w-32 sm:h-48 rounded-2xl overflow-hidden bg-neutral-900 border-2 border-white/40 shadow-2xl">
        {isCameraOff ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 p-2 text-center bg-neutral-900">
            <VideoOff className="w-6 h-6 mb-1 text-neutral-500" />
            <span className="text-[10px]">Camera Off</span>
          </div>
        ) : (
          <video
            ref={userVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${
              facingMode === 'user' ? '-scale-x-100' : ''
            }`}
          />
        )}
      </div>

      {/* Bottom Call Controls */}
      <div className="relative z-20 pb-8 pt-4 px-6 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-center gap-5">
        {/* Toggle Mic */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`w-13 h-13 rounded-full flex items-center justify-center transition-all ${
            isMuted ? 'bg-red-600 text-white' : 'bg-white/20 text-white hover:bg-white/30'
          }`}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* End Call */}
        <button
          onClick={onClose}
          className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 text-white flex items-center justify-center shadow-2xl transition-transform"
          title="End Call"
        >
          <PhoneOff className="w-7 h-7" />
        </button>

        {/* Toggle Video */}
        <button
          onClick={toggleCamera}
          className={`w-13 h-13 rounded-full flex items-center justify-center transition-all ${
            isCameraOff ? 'bg-red-600 text-white' : 'bg-white/20 text-white hover:bg-white/30'
          }`}
          title={isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
        >
          {isCameraOff ? (
            <VideoOff className="w-5 h-5" />
          ) : (
            <Video className="w-5 h-5" />
          )}
        </button>

        {/* Flip Camera */}
        {!isCameraOff && (
          <button
            onClick={flipCamera}
            className="w-13 h-13 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all"
            title="Flip Camera"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
