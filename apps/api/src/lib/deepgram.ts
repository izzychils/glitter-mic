import { env } from "./env";

// Deepgram API types (based on REST API documentation)
interface DeepgramUtterance {
  start: number;
  end: number;
  confidence: number;
  channel: number;
  transcript: string;
  words: Array<{
    word: string;
    start: number;
    end: number;
    confidence: number;
  }>;
  speaker?: number;
  id: string;
}

interface DeepgramResponse {
  metadata: {
    transaction_key: string;
    request_id: string;
    sha256: string;
    created: string;
    duration: number;
    channels: number;
  };
  results: {
    channels: Array<{
      alternatives: Array<{
        transcript: string;
        confidence: number;
        words: Array<{
          word: string;
          start: number;
          end: number;
          confidence: number;
          punctuated_word?: string;
        }>;
      }>;
    }>;
    utterances?: DeepgramUtterance[];
  };
}

/**
 * Converts audio URL to LRC format with precise timestamps using Deepgram transcription
 * Uses REST API directly for better reliability
 */
export async function generateLrcFromAudio(audioUrl: string): Promise<string> {
  try {
    console.log("Deepgram: Fetching audio from URL:", audioUrl.substring(0, 100) + "...");
    
    // Download audio file as buffer using fetch (built-in in Node 18+)
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      throw new Error(`Failed to fetch audio: ${audioResponse.statusText}`);
    }
    
    // Get content type to verify it's audio
    const contentType = audioResponse.headers.get("content-type");
    console.log("Deepgram: Audio content-type:", contentType);
    
    const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());
    console.log("Deepgram: Downloaded audio buffer size:", audioBuffer.length, "bytes");

    if (audioBuffer.length === 0) {
      throw new Error("Downloaded audio file is empty");
    }

    // Call Deepgram REST API for transcription
    console.log("Deepgram: Sending to API for transcription...");
    const deepgramResponse = await fetch(
      "https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&punctuate=true&utterances=true&utt_split=0.8",
      {
        method: "POST",
        headers: {
          Authorization: `Token ${env.DEEPGRAM_API_KEY}`,
          "Content-Type": contentType || "audio/mpeg",
        },
        body: audioBuffer,
      }
    );

    if (!deepgramResponse.ok) {
      const errorText = await deepgramResponse.text();
      console.error("Deepgram API error:", errorText);
      throw new Error(`Deepgram API error: ${deepgramResponse.status} - ${errorText}`);
    }

    const result = await deepgramResponse.json() as DeepgramResponse;
    console.log("Deepgram: Transcription received, utterances:", result.results.utterances?.length || 0);

    if (!result?.results?.utterances || result.results.utterances.length === 0) {
      throw new Error("No transcription results from Deepgram");
    }

    // Convert Deepgram utterances to LRC format
    const lrcLines: string[] = [];
    
    for (const utterance of result.results.utterances) {
      const startTime = utterance.start;
      const transcript = utterance.transcript.trim();
      
      if (transcript) {
        // Convert seconds to [MM:SS.xx] format
        const minutes = Math.floor(startTime / 60);
        const seconds = startTime % 60;
        const timestamp = `[${String(minutes).padStart(2, "0")}:${String(Math.floor(seconds)).padStart(2, "0")}.${String(Math.floor((seconds % 1) * 100)).padStart(2, "0")}]`;
        
        lrcLines.push(`${timestamp}${transcript}`);
      }
    }

    console.log("Deepgram: Generated", lrcLines.length, "LRC lines");
    return lrcLines.join("\n");
  } catch (error) {
    console.error("Deepgram LRC generation error:", error);
    throw new Error(`Failed to generate LRC: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
