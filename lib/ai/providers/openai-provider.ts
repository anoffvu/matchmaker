import { createOpenAI, openai } from "@ai-sdk/openai";
import { AIProvider } from "@/lib/ai/types";
import { AI_MODELS } from "@/lib/ai/constants";

export class OpenAIProvider implements AIProvider {
  private client: typeof openai;

  constructor() {
    this.client = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });
  }

  async generateResponse(prompt: string): Promise<string> {
    throw new Error("Method not implemented. Could not process: " + prompt);
  }

  async generateStreamingResponse(prompt: string): Promise<ReadableStream> {
    throw new Error("Method not implemented. Could not process: " + prompt);
  }

  async generateEmbedding(value: string): Promise<number[]> {
    try {
      const model = this.client.embedding(AI_MODELS.OPENAI.EMBEDDING);
      const response = await model.doEmbed({ values: [value] });
      return response.embeddings.map(x => x as unknown as number);
    } catch (err) {
      throw err;
    }
  }
}
