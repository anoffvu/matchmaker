export interface AIProvider {
  generateResponse(prompt: string): Promise<string>
  generateStreamingResponse(prompt: string): Promise<ReadableStream>
}

export type AIModelProvider = 'anthropic' | 'gemini'
