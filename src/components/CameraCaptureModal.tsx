import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, AlertCircle } from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [permissionError, setPermissionError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    stopCamera();
    setPermissionError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser or environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('Camera error:', err);
      let msg = 'Could not access camera.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Camera permission was denied. Please allow camera permissions in your browser settings.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'No camera device found.';
      }
      setPermissionError(msg);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // If user front camera, mirror image for natural selfie feel
      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

      stopCamera();
      onCapture(dataUrl);
    } catch (err) {
      console.error('Failed to capture frame', err);
    }
  };

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 z-10 text-white">
        <button
          onClick={onClose}
          className="p-2.5 bg-black/40 rounded-full hover:bg-black/60 transition-colors"
          aria-label="Close camera"
        >
          <X className="w-6 h-6" />
        </button>
        <span className="text-sm font-semibold tracking-wide text-white/90">
          Camera
        </span>
        <button
          onClick={toggleCameraFacing}
          className="p-2.5 bg-black/40 rounded-full hover:bg-black/60 transition-colors"
          title="Flip camera"
          aria-label="Flip camera"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Video Viewport */}
      <div className="relative flex-1 flex items-center justify-center bg-black overflow-hidden">
        {permissionError ? (
          <div className="p-6 text-center max-w-sm bg-neutral-900/90 rounded-2xl border border-neutral-700 mx-4">
            <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
            <p className="text-sm text-neutral-200 mb-4">{permissionError}</p>
            <button
              onClick={startCamera}
              className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-full active:scale-95"
            >
              Retry Access
            </button>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${
              facingMode === 'user' ? '-scale-x-100' : ''
            }`}
          />
        )}
      </div>

      {/* Bottom Shutter Controls */}
      <div className="p-6 bg-black/80 flex items-center justify-center pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <button
          onClick={capturePhoto}
          disabled={Boolean(permissionError)}
          className="w-18 h-18 rounded-full border-4 border-white p-1 hover:scale-105 active:scale-95 transition-all flex items-center justify-center disabled:opacity-40"
          aria-label="Take photo"
        >
          <div className="w-full h-full rounded-full bg-white hover:bg-neutral-200 transition-colors flex items-center justify-center">
            <Camera className="w-6 h-6 text-black" />
          </div>
        </button>
      </div>
    </div>
  );
};
