import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIProvider } from "@/lib/ai/types";
import { AI_MODELS } from "@/lib/ai/constants";

export class GeminiProvider implements AIProvider {
  private client: GoogleGenerativeAI;

  constructor() {
    this.client = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
  }

  async generateResponse(prompt: string): Promise<string> {
    const model = this.client.getGenerativeModel({
      model: AI_MODELS.GEMINI.PRO,
    });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  async generateStreamingResponse(prompt: string): Promise<ReadableStream> {
    const model = this.client.getGenerativeModel({
      model: AI_MODELS.GEMINI.PRO,
    });
    const result = await model.generateContentStream(prompt);

    // Convert Gemini's stream to a standard ReadableStream
    return new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            controller.enqueue(chunk.text());
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });
  }

  async generateEmbedding(value: string): Promise<number[]> {
    const model = this.client.getGenerativeModel({
      model: AI_MODELS.GEMINI.EMBEDDING,
    });

    try {
      const result = await model.embedContent(value);
      return result.embedding.values;
    } catch (err) {
      throw err;
    }
  }
}
