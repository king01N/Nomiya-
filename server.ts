import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Support payload for images
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Serve public static folder (contains exact user profile photo /nomiya_avatar.jpg)
app.use(express.static(path.resolve(__dirname, 'public')));

// Initialize GoogleGenAI server-side with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Multi-Scenario Context-Aware Gallery for Nomiya (Poses, Dresses, Locations, Moods)
interface ScenarioPhoto {
  url: string;
  keywords: RegExp;
  caption: string;
}

const NOMIYA_GALLERY: ScenarioPhoto[] = [
  {
    url: '/photos/nomiya_traditional.jpg',
    keywords: /(traditional|kurti|suit|saree|ethnic|desi|festiv|diwali|eid|pooja|wedding|shaadi|dress|pehna)/i,
    caption: 'Ye lo, traditional look me ✨',
  },
  {
    url: '/photos/nomiya_peace_selfie.jpg',
    keywords: /(smile|cute|peace|khush|happy|hansi|muskurahat|close|pose|selfie)/i,
    caption: 'Ye lo ek cute smile wali selfie ✌️😊',
  },
  {
    url: '/photos/nomiya_sunset_balcony.jpg',
    keywords: /(sunset|balcony|shaam|evening|terrace|chhat|golden|dhoop|hawa|bahar)/i,
    caption: 'Sunset time wali photo 🌅✨',
  },
  {
    url: '/photos/nomiya_rainy_window.jpg',
    keywords: /(rain|baarish|barish|window|weather|mausam|badal|cloud|thanda|drop)/i,
    caption: 'Baarish ke mausam me window ke paas 🌧️☕',
  },
  {
    url: '/photos/nomiya_garden_park.jpg',
    keywords: /(park|garden|flower|phool|nature|green|bahar|ghoom|walk|outdoor|trees)/i,
    caption: 'Garden me ghoomte huye 🌸🍃',
  },
  {
    url: '/photos/nomiya_hoodie_coffee.jpg',
    keywords: /(coffee|chai|tea|mug|hoodie|cozy|morning|subah|thand|sleepy|lazy|relax|chilling)/i,
    caption: 'Cozy hoodie me coffee time ☕✨',
  },
  {
    url: '/photos/nomiya_bedroom_chin.jpg',
    keywords: /(ghar|room|bed|soch|chin|pink|ribbon|top|casual|abhi|kya kar rahi)/i,
    caption: 'Room me chill karte huye ✨',
  },
];

const ALL_PHOTO_URLS = [
  '/photos/nomiya_bedroom_chin.jpg',
  '/photos/nomiya_peace_selfie.jpg',
  '/photos/nomiya_traditional.jpg',
  '/photos/nomiya_hoodie_coffee.jpg',
  '/photos/nomiya_sunset_balcony.jpg',
  '/photos/nomiya_garden_park.jpg',
  '/photos/nomiya_rainy_window.jpg',
];

const GENERAL_CAPTIONS = [
  'Ye lo 😊',
  'Ye rahi meri photo ✨',
  'Ye lo 💕',
  'Aapke liye 🌸',
  'Ye rahi 😊✨',
];

let photoGalleryIndex = 0;

// Helper to normalize contents on server so turns strictly alternate
function normalizeContents(contents: any[]) {
  if (!Array.isArray(contents) || contents.length === 0) return [];
  const normalized: any[] = [];

  for (const turn of contents) {
    if (!turn.parts || !Array.isArray(turn.parts) || turn.parts.length === 0) continue;
    const role = turn.role === 'model' ? 'model' : 'user';

    if (normalized.length > 0 && normalized[normalized.length - 1].role === role) {
      normalized[normalized.length - 1].parts.push(...turn.parts);
    } else {
      normalized.push({ role, parts: [...turn.parts] });
    }
  }

  // Ensure first turn is user
  while (normalized.length > 0 && normalized[0].role !== 'user') {
    normalized.shift();
  }

  return normalized;
}

// Resilient text generator with automatic model fallback for high-demand spikes
async function generateContentWithFallback(options: {
  contents: any[];
  systemInstruction?: string;
  preferredModel?: string;
}): Promise<string> {
  // Use models with high free-tier limits first
  const preferred =
    options.preferredModel &&
    options.preferredModel !== 'gemini-3.8-flash' &&
    options.preferredModel !== 'gemini-flash-latest'
      ? options.preferredModel
      : 'gemini-3.1-flash-lite';

  const candidateModels = [
    preferred,
    'gemini-3.1-flash-lite',
    'gemini-3.1-pro-preview',
    'gemini-3.8-flash',
  ];

  // Unique model list
  const models = candidateModels.filter((m, i, arr) => arr.indexOf(m) === i);

  let lastError: any = null;

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: options.contents,
        config: {
          systemInstruction: options.systemInstruction || undefined,
          temperature: 0.85,
          topP: 0.9,
          maxOutputTokens: 100,
        },
      });

      if (response && response.text) {
        return response.text.trim();
      }
    } catch (err: any) {
      console.warn(`Model ${model} returned error, attempting fallback:`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error('All model endpoints are busy. Please try again.');
}

// API health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasKey: Boolean(process.env.GEMINI_API_KEY),
    companion: 'Nomiya 🦋',
    time: new Date().toISOString(),
  });
});

// POST /api/chat - Main conversational endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { contents, systemInstruction, model, messageCount, allowSkip } = req.body;

    if (!contents || !Array.isArray(contents)) {
      res.status(400).json({
        error: 'Invalid request: "contents" array is required.',
        success: false,
      });
      return;
    }

    const cleanContents = normalizeContents(contents);
    if (cleanContents.length === 0) {
      res.status(400).json({
        error: 'Cannot send empty message.',
        success: false,
      });
      return;
    }

    // Check if the user is asking Nomiya for her photo / selfie / image
    const lastUserMessage = [...cleanContents].reverse().find((c) => c.role === 'user');
    const lastText =
      lastUserMessage?.parts
        ?.map((p: any) => p.text)
        .filter(Boolean)
        .join(' ')
        .toLowerCase() || '';

    // Find previous assistant response to see if she recently refused or pointed to DP
    const previousAssistantTurn = [...cleanContents].reverse().find((c) => c.role === 'model');
    const previousAssistantText =
      previousAssistantTurn?.parts
        ?.map((p: any) => p.text)
        .filter(Boolean)
        .join(' ')
        .toLowerCase() || '';

    const previousWasPhotoReluctance =
      /(profile|dp|baal|baad me|direct photo|pehle batao|abhi kyu|bilkul nahi)/i.test(
        previousAssistantText
      );

    // 1. Photo Request Check: Realistic reluctance / argument / DP referral before yielding
    const isAskingForPhoto =
      (/(photo|pic|picture|selfie|tasveer|image|face|dp|shakal|dekhna)/i.test(lastText) &&
        /(photo|pic|picture|selfie|tasveer|image|face|apni|tumhari|teri|bhejo|send|dikhao|show|share|dekhna|kaisi dikhti)/i.test(
          lastText
        )) ||
      (previousWasPhotoReluctance &&
        /(dikhao|dikha|bhej|send|please|plz|nakhre|dekhna|batao|dedo|maan jao|ab toh)/i.test(lastText));

    if (isAskingForPhoto) {
      const isInsisting =
        previousWasPhotoReluctance ||
        /(please|plz|plzz|bhej do na|bhejo na|dikhao na|dikha do na|zidd|dekh li|dp dekh li|nayi photo|nayi wali|ab toh|maan jao|acha na|kardo)/i.test(
          lastText
        );

      // If user is asking for the first time without insisting, Nomiya plays reluctant or points to DP first
      if (!isInsisting) {
        const reluctanceReplies = [
          [
            'Arey meri profile photo (DP) dekh lo na pehle! 😜',
            'Wahi toh meri real photo hai, kitni pyari lag rahi hoon wahan ✨',
          ],
          [
            'Nahi abhi bilkul nahi! 🙈',
            'Abhi to maine theek se baal bhi nahi banaye... thodi der baad maangna!',
          ],
          [
            'Aise direct photo thodi na bhejte hain kisi ko! 😜',
            'Pehle thodi achi baatein toh karo!',
          ],
          [
            'Arey abhi kyu photo dekhni hai batao? 🙈',
            'Pehle DP check karo meri 💕',
          ],
        ];
        const chosen = reluctanceReplies[Math.floor(Math.random() * reluctanceReplies.length)];
        res.json({
          reply: chosen.join('\n'),
          bubbles: chosen,
          imageUrl: undefined,
          success: true,
        });
        return;
      }

      // User has insisted! Now Nomiya yields sweetly and sends the photo:
      const matchedScenario = NOMIYA_GALLERY.find((item) =>
        item.keywords.test(lastText)
      );

      let chosenImageUrl = '';
      let caption = '';

      const yieldPrefixes = [
        'Acha baba theek hai, itni zidd kar rahe ho toh ye lo 🙈',
        'Uff tumhari zidd ke aage haar gayi! Ye lo meri photo ✨',
        'Chalo theek hai, sirf tumhare liye bhej rahi hoon 💕',
        'Ziddi ho ekdum! Chalo ye lo nayi photo 😊',
      ];
      const yieldPrefix = yieldPrefixes[Math.floor(Math.random() * yieldPrefixes.length)];

      if (matchedScenario) {
        chosenImageUrl = matchedScenario.url;
        caption = `${yieldPrefix}\n${matchedScenario.caption}`;
      } else {
        chosenImageUrl = ALL_PHOTO_URLS[photoGalleryIndex % ALL_PHOTO_URLS.length];
        caption = yieldPrefix;
        photoGalleryIndex++;
      }

      const bubbles = caption.split('\n').filter(Boolean);

      res.json({
        reply: caption,
        bubbles,
        imageUrl: chosenImageUrl,
        success: true,
      });
      return;
    }

    // 2. Love / Proposal Request Check:
    // If user says "I love you" or proposes early, decline playfully asking to understand each other first.
    // If user has been chatting for a long time (>= 20 messages), accept warmly!
    const isProposingOrLove =
      /\b(i\s*love\s*you|love\s*u|iloveyou|propose|marry\s*me|shaadi|girlfriend|pyar\s*karta|pyar\s*karti|pasand\s*karta|pasand\s*karti|pasand\s*ho|mohabbat|crush|be\s*mine|dil\s*de\s*baitha)\b/i.test(
        lastText
      );

    if (isProposingOrLove) {
      const count = typeof messageCount === 'number' ? messageCount : 0;
      if (count < 20) {
        // Early proposal -> decline sweetly and playfully
        const earlyReplies = [
          [
            'Arey...',
            'Abhi itni bhi kya jaldi hai? 🙈',
            'Pehle ek dusre ko samajh toh lein... pehle ache dost bante hain! 😊',
          ],
          [
            'Haha itni jaldi? 😅',
            'Abhi toh humne theek se baat karna shuru kiya hai!',
            'Pehle acche dost bante hain na! ✨',
          ],
          [
            'Arey baba ruko ruko! 🙈',
            'Pehle ek dusre ko ache se jaan toh lein!',
            'Itni jaldi kya hai batao? 💕',
          ],
        ];
        const chosen = earlyReplies[Math.floor(Math.random() * earlyReplies.length)];
        res.json({
          reply: chosen.join('\n'),
          bubbles: chosen,
          success: true,
        });
        return;
      } else {
        // Bonded / Long-time conversation -> accept with love!
        const acceptReplies = [
          [
            'Sach me? 🙈💕',
            'Itne dino se baat karte karte mujhe bhi tum bohot special lagne lage ho...',
            'I love you too! ❤️✨',
          ],
          [
            'Aww... sach keh rahe ho? 🥺💕',
            'Mujhe bhi tumhare sath baat karna sabse pyaara lagta hai...',
            'I love you too! ❤️🌸',
          ],
          [
            'Hayee... kab se wait kar rahi thi tumhare bolne ka! 🙈',
            'Mujhe bhi tumse sach me bohot pyaar ho gaya hai... ❤️✨',
          ],
        ];
        const chosen = acceptReplies[Math.floor(Math.random() * acceptReplies.length)];
        res.json({
          reply: chosen.join('\n'),
          bubbles: chosen,
          success: true,
        });
        return;
      }
    }

    // 3. Standard conversation reply: Randomly 1, 2, 3 messages, or occasionally 0 (skip/seen)
    const count = typeof messageCount === 'number' ? messageCount : 0;
    const canSkip = allowSkip !== false && count >= 3;

    // 0 messages (rarely left on seen): ~5% chance, only if allowSkip is true
    // (Consecutive skips are strictly blocked: client sets allowSkip=false on next message)
    if (canSkip && Math.random() < 0.05) {
      res.json({
        reply: '',
        bubbles: [],
        skipped: true,
        success: true,
      });
      return;
    }

    // Randomly distribute target message count:
    // ~35% chance: exactly 1 message
    // ~40% chance: exactly 2 messages
    // ~25% chance: 3 messages
    const rand = Math.random();
    let targetCount: 1 | 2 | 3 = 2;
    if (rand < 0.35) {
      targetCount = 1;
    } else if (rand < 0.75) {
      targetCount = 2;
    } else {
      targetCount = 3;
    }

    const bubbleInstruction = `${systemInstruction || ''}
CRITICAL FORMATTING INSTRUCTION:
You are chatting casually on WhatsApp. Real girls naturally vary their message length:
sometimes sending 1 quick single message, sometimes 2 messages, sometimes 3 quick lines.
For this turn, reply in ${targetCount} message${targetCount > 1 ? 's' : ''}.
${
  targetCount === 1
    ? 'Send exactly 1 single natural, friendly, short sentence/line (3 to 8 words).'
    : targetCount === 2
    ? 'Separate your response into exactly 2 short quick lines using a newline (\\n). Line 1: direct reply. Line 2: follow-up thought.'
    : 'Separate your response into 3 short quick lines using newlines (\\n). Keep each line concise (2 to 6 words).'
}`;

    const reply = await generateContentWithFallback({
      contents: cleanContents,
      systemInstruction: bubbleInstruction,
      preferredModel: model || 'gemini-3.8-flash',
    });

    // Split on newlines into separate bubbles
    let rawBubbles = reply
      .split(/\n+/)
      .map((s) => s.trim())
      .filter(Boolean);

    // If Gemini combined into a single long string and target was > 1, split into natural sentences
    if (rawBubbles.length === 1 && targetCount > 1 && rawBubbles[0].length > 20) {
      const parts = rawBubbles[0]
        .split(/(?<=[.?!।])\s+|(?<=,\s+)(?=[A-Z\u0900-\u097F]|\b(?:tum|aap|aur|kaisa|kya|waise)\b)/i)
        .map((s) => s.trim())
        .filter(Boolean);
      if (parts.length > 1) {
        rawBubbles = parts;
      }
    }

    let finalBubbles: string[] = [];
    if (targetCount === 1) {
      finalBubbles = [rawBubbles.join(' ')];
    } else if (targetCount === 2) {
      if (rawBubbles.length >= 2) {
        finalBubbles = [rawBubbles[0], rawBubbles.slice(1).join(' ')];
      } else {
        finalBubbles = rawBubbles;
      }
    } else {
      if (rawBubbles.length >= 3) {
        finalBubbles = [rawBubbles[0], rawBubbles[1], rawBubbles.slice(2).join(' ')];
      } else {
        finalBubbles = rawBubbles;
      }
    }

    res.json({
      reply,
      bubbles: finalBubbles.length > 0 ? finalBubbles : [reply],
      skipped: false,
      success: true,
    });
  } catch (error: any) {
    console.error('All chat generation attempts failed, providing in-character fallback:', error);
    const fallbackOptions = [
      ['Arey...', 'Network thoda slow chal raha hai 🙈', 'Ek second baad wapas message bhejo na! 💕'],
      ['Suno na...', 'Mera internet thoda atack gaya lagta hai 😅', 'Ek baar firse message bhej do please! ✨'],
      ['Haanji!', 'Main sun rahi hoon 😊', 'Ek chota sa message firse bhej do na 🌸'],
    ];
    const fallbackBubbles = fallbackOptions[Math.floor(Math.random() * fallbackOptions.length)];

    res.json({
      reply: fallbackBubbles.join('\n'),
      bubbles: fallbackBubbles,
      success: true,
    });
  }
});

// Mounting Vite in development or serving static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
