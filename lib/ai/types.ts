export interface AIProvider {
  generateResponse(prompt: string): Promise<string>
  generateStreamingResponse(prompt: string): Promise<ReadableStream>
  generateEmbedding (value: string): Promise<number[]>
}

export type AIModelProvider = 'anthropic' | 'gemini'
