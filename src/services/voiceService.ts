/**
 * Service to handle speech-to-text (recognition) and text-to-speech (synthesis)
 * Tuned for a natural 23-year-old Indian companion voice (Nomiya 🦋)
 */

type RecognitionCallback = (transcript: string, isFinal: boolean) => void;
type StatusCallback = (isListening: boolean, error?: string) => void;

interface IWindowWithSpeech extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

class VoiceService {
  private recognition: any = null;
  private isListening = false;
  private currentAudio: HTMLAudioElement | null = null;

  constructor() {
    this.initRecognition();
  }

  public isSpeechSupported(): boolean {
    if (typeof window === 'undefined') return false;
    const win = window as IWindowWithSpeech;
    return Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
  }

  private initRecognition() {
    if (typeof window === 'undefined') return;
    const win = window as IWindowWithSpeech;
    const SpeechConstructor = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (SpeechConstructor) {
      try {
        this.recognition = new SpeechConstructor();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        // Support Hindi & Indian English seamlessly
        this.recognition.lang = 'hi-IN';
      } catch (e) {
        console.warn('SpeechRecognition initialization error:', e);
      }
    }
  }

  /**
   * Starts microphone voice recording for speech-to-text
   */
  startListening(
    onResult: RecognitionCallback,
    onStatusChange: StatusCallback
  ): boolean {
    if (!this.recognition) {
      this.initRecognition();
      if (!this.recognition) {
        onStatusChange(false, 'Speech recognition is not supported in this browser.');
        return false;
      }
    }

    if (this.isListening) {
      this.stopListening();
    }

    try {
      this.recognition.onstart = () => {
        this.isListening = true;
        onStatusChange(true);
      };

      this.recognition.onresult = (event: any) => {
        let transcript = '';
        let isFinal = false;

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            isFinal = true;
          }
        }

        onResult(transcript, isFinal);
      };

      this.recognition.onerror = (event: any) => {
        let message = 'Could not access microphone.';
        if (event.error === 'not-allowed') {
          message = 'Microphone permission denied. Please allow microphone access.';
        } else if (event.error === 'no-speech') {
          message = 'No speech detected.';
        }
        this.isListening = false;
        onStatusChange(false, message);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        onStatusChange(false);
      };

      this.recognition.start();
      return true;
    } catch (err: any) {
      this.isListening = false;
      onStatusChange(false, err?.message || 'Failed to start microphone');
      return false;
    }
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {}
      this.isListening = false;
    }
  }

  /**
   * Plays audio from base64 (e.g. Gemini TTS) or falls back to Web Speech Synthesis
   */
  async speakText(text: string, audioBase64?: string): Promise<void> {
    this.stopSpeaking();

    // 1. If high quality Gemini audio wav base64 is available
    if (audioBase64) {
      return new Promise((resolve) => {
        try {
          const audioSrc = `data:audio/wav;base64,${audioBase64}`;
          const audio = new Audio(audioSrc);
          this.currentAudio = audio;

          audio.onended = () => {
            this.currentAudio = null;
            resolve();
          };

          audio.onerror = () => {
            this.currentAudio = null;
            this.speakWithSpeechSynthesis(text).then(resolve);
          };

          audio.play().catch(() => {
            this.speakWithSpeechSynthesis(text).then(resolve);
          });
        } catch {
          this.speakWithSpeechSynthesis(text).then(resolve);
        }
      });
    }

    // 2. Realistic 23-year-old Indian girl voice fallback using Speech Synthesis
    return this.speakWithSpeechSynthesis(text);
  }

  private speakWithSpeechSynthesis(text: string): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        resolve();
        return;
      }

      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);

        // Find best realistic Indian female voice
        const voices = window.speechSynthesis.getVoices();

        const indianFemaleVoice =
          voices.find(
            (v) =>
              (v.lang === 'hi-IN' || v.lang === 'en-IN' || v.lang.startsWith('hi')) &&
              (v.name.toLowerCase().includes('female') ||
                v.name.toLowerCase().includes('heera') ||
                v.name.toLowerCase().includes('swara') ||
                v.name.toLowerCase().includes('kavita') ||
                v.name.toLowerCase().includes('neerja') ||
                v.name.toLowerCase().includes('veena') ||
                v.name.toLowerCase().includes('kalpana') ||
                v.name.toLowerCase().includes('google'))
          ) ||
          voices.find(
            (v) => v.lang === 'hi-IN' || v.lang === 'en-IN'
          ) ||
          voices.find(
            (v) =>
              v.name.includes('Natural') ||
              v.name.includes('Samantha') ||
              v.name.includes('Victoria') ||
              v.name.includes('Karen') ||
              v.name.toLowerCase().includes('female')
          );

        if (indianFemaleVoice) {
          utterance.voice = indianFemaleVoice;
          if (indianFemaleVoice.lang) {
            utterance.lang = indianFemaleVoice.lang;
          }
        }

        // Tuned for natural 23-year-old young Indian woman tone:
        // Sweet, soft, warm pitch and natural conversational pacing
        utterance.pitch = 1.15;
        utterance.rate = 0.98;

        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();

        window.speechSynthesis.speak(utterance);
      } catch {
        resolve();
      }
    });
  }

  stopSpeaking(): void {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch {}
      this.currentAudio = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  }
}

export const voiceService = new VoiceService();
