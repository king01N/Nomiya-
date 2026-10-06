import { ChatMessage } from '../types';
import { BUILD_SYSTEM_INSTRUCTION, GEMINI_MODEL } from '../config/character';

interface SendMessageOptions {
  history: ChatMessage[];
  userText: string;
  imageBase64?: string;
  imageMimeType?: string;
  characterName: string;
  model?: string;
  messageCount?: number;
  allowSkip?: boolean;
}

export const geminiService = {
  /**
   * Prepares and sends conversation messages to the server-side Gemini API
   */
  async sendMessage({
    history,
    userText,
    imageBase64,
    imageMimeType = 'image/jpeg',
    characterName,
    model = GEMINI_MODEL,
    messageCount,
    allowSkip = true,
  }: SendMessageOptions): Promise<{ reply: string; bubbles: string[]; imageUrl?: string; skipped?: boolean }> {
    // 1. Build context from recent history (last 12 messages)
    const contextMessages = history.slice(-12);

    const rawTurns: Array<{
      role: 'user' | 'model';
      parts: Array<
        | { text: string }
        | { inlineData: { mimeType: string; data: string } }
      >;
    }> = [];

    // Format previous turns
    for (let i = 0; i < contextMessages.length; i++) {
      const msg = contextMessages[i];
      if (msg.status === 'error') continue;

      const role: 'user' | 'model' = msg.sender === 'user' ? 'user' : 'model';
      const parts: Array<
        | { text: string }
        | { inlineData: { mimeType: string; data: string } }
      > = [];

      // For older messages with images, include a light textual indicator
      // rather than sending megabytes of duplicate base64 over and over
      if (msg.imageUrl && msg.sender === 'user') {
        const caption = msg.text ? ` (Caption: "${msg.text}")` : '';
        parts.push({ text: `[Photo shared by user${caption}]` });
      } else if (msg.isSticker && msg.stickerEmoji) {
        parts.push({ text: `[Sticker: ${msg.stickerEmoji}]` });
      } else if (msg.text && msg.text.trim()) {
        parts.push({ text: msg.text.trim() });
      }

      if (parts.length > 0) {
        rawTurns.push({ role, parts });
      }
    }

    // 2. Prepare current turn
    const currentParts: Array<
      | { text: string }
      | { inlineData: { mimeType: string; data: string } }
    > = [];

    if (imageBase64) {
      const cleanBase64 = imageBase64.includes('base64,')
        ? imageBase64.split('base64,')[1]
        : imageBase64;
      currentParts.push({
        inlineData: {
          mimeType: imageMimeType,
          data: cleanBase64,
        },
      });
    }

    const trimmedText = userText.trim();
    if (trimmedText) {
      currentParts.push({ text: trimmedText });
    } else if (imageBase64) {
      currentParts.push({ text: 'Look at this photo I shared!' });
    }

    if (currentParts.length === 0) {
      throw new Error('Message cannot be empty');
    }

    rawTurns.push({
      role: 'user',
      parts: currentParts,
    });

    // 3. Strict Normalization for Gemini API:
    // Consecutive turns of the same role MUST be merged together so turns alternate user -> model -> user
    const normalizedContents: Array<{
      role: 'user' | 'model';
      parts: Array<
        | { text: string }
        | { inlineData: { mimeType: string; data: string } }
      >;
    }> = [];

    for (const turn of rawTurns) {
      if (!turn.parts || turn.parts.length === 0) continue;

      if (
        normalizedContents.length > 0 &&
        normalizedContents[normalizedContents.length - 1].role === turn.role
      ) {
        // Merge with existing consecutive turn of same role
        normalizedContents[normalizedContents.length - 1].parts.push(...turn.parts);
      } else {
        normalizedContents.push({
          role: turn.role,
          parts: [...turn.parts],
        });
      }
    }

    // Ensure the conversation begins with a 'user' turn
    while (normalizedContents.length > 0 && normalizedContents[0].role !== 'user') {
      normalizedContents.shift();
    }

    // If empty after shift, add the current turn
    if (normalizedContents.length === 0) {
      normalizedContents.push({
        role: 'user',
        parts: currentParts,
      });
    }

    const systemInstruction = BUILD_SYSTEM_INSTRUCTION(characterName);

    // 4. Send to server
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: normalizedContents,
        systemInstruction,
        model,
        messageCount,
        allowSkip,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const err = data.error || 'Failed to reach companion';
      throw new Error(err);
    }

    if (data.skipped) {
      return {
        reply: '',
        bubbles: [],
        skipped: true,
      };
    }

    const bubbles: string[] = Array.isArray(data.bubbles) && data.bubbles.length > 0
      ? data.bubbles
      : (data.reply ? data.reply.split(/\n+/).map((s: string) => s.trim()).filter(Boolean) : []);

    return {
      reply: data.reply || '',
      bubbles: bubbles.length > 0 ? bubbles : [data.reply || ''],
      imageUrl: data.imageUrl,
      skipped: false,
    };
  },

  /**
   * Interactive voice call turn
   */
  async sendVoiceTurn(
    history: ChatMessage[],
    userSpeech: string,
    characterName: string
  ): Promise<{ reply: string; audioBase64?: string }> {
    const contextMessages = history.slice(-6);

    const rawTurns: Array<{ role: 'user' | 'model'; parts: { text: string }[] }> = [];

    for (const m of contextMessages) {
      if (m.status === 'error' || !m.text) continue;
      const role = m.sender === 'user' ? ('user' as const) : ('model' as const);
      rawTurns.push({
        role,
        parts: [{ text: m.text }],
      });
    }

    rawTurns.push({
      role: 'user',
      parts: [{ text: userSpeech }],
    });

    // Normalize turns
    const normalized: Array<{ role: 'user' | 'model'; parts: { text: string }[] }> = [];
    for (const turn of rawTurns) {
      if (normalized.length > 0 && normalized[normalized.length - 1].role === turn.role) {
        normalized[normalized.length - 1].parts.push(...turn.parts);
      } else {
        normalized.push({ role: turn.role, parts: [...turn.parts] });
      }
    }

    while (normalized.length > 0 && normalized[0].role !== 'user') {
      normalized.shift();
    }

    const systemInstruction = BUILD_SYSTEM_INSTRUCTION(characterName);

    const res = await fetch('/api/voice-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: normalized,
        systemInstruction,
        requestAudio: true,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Voice call processing failed');
    }

    return {
      reply: data.reply,
      audioBase64: data.audioBase64,
    };
  },
};
