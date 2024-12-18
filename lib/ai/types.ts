export interface AIProvider {
  generateResponse(prompt: string, mode?: "text" | "json"): Promise<string>;
  generateStreamingResponse(prompt: string): Promise<ReadableStream>;
  generateEmbedding(value: string): Promise<number[]>;
}

export type AIModelProvider = "anthropic" | "gemini" | "openai";
