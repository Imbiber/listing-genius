const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';
const DEFAULT_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'; // Rachel - natural, expressive

export interface TextToSpeechOptions {
  voiceId?: string;
  modelId?: string;
}

/**
 * Converts input text into an audio buffer using ElevenLabs Text-to-Speech API.
 */
export async function textToSpeech(
  text: string,
  options: TextToSpeechOptions = {}
): Promise<Buffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_key_here') {
    throw new Error(
      'ELEVENLABS_API_KEY is not configured. Please set your ElevenLabs API key in .env.local to enable speech narration.'
    );
  }

  const voiceId = options.voiceId || DEFAULT_VOICE_ID;
  const modelId = options.modelId || 'eleven_multilingual_v2';

  const cleanText = text.trim();
  if (!cleanText) {
    throw new Error('Text to speak cannot be empty');
  }

  const response = await fetch(`${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text: cleanText,
      model_id: modelId,
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let errorMessage = `ElevenLabs API error (${response.status})`;
    try {
      const errorJson = JSON.parse(errorBody);
      if (errorJson.detail && errorJson.detail.message) {
        errorMessage += `: ${errorJson.detail.message}`;
      } else if (errorJson.message) {
        errorMessage += `: ${errorJson.message}`;
      }
    } catch {
      errorMessage += `: ${errorBody}`;
    }
    throw new Error(errorMessage);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
