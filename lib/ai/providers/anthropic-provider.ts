import Anthropic from '@anthropic-ai/sdk'
import { AIProvider } from '../types'
import { AI_MODELS } from '../constants'

export class AnthropicProvider implements AIProvider {
  private client: Anthropic

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    })
  }

  async generateResponse(prompt: string): Promise<string> {
    const response = await this.client.messages.create({
      model: AI_MODELS.ANTHROPIC.CLAUDE_HAIKU,
      max_tokens: 4000,
      temperature: 0.7,
      messages: [{ role: 'user', content: prompt }],
    })
    if (response.content[0].type !== 'text') {
      throw new Error('Expected text response from Anthropic')
    }
    return response.content[0].text
  }

  async generateStreamingResponse(prompt: string): Promise<ReadableStream> {
    const response = await this.client.messages.create({
      model: AI_MODELS.ANTHROPIC.CLAUDE_SONNET,
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    })
    return new ReadableStream({
      async start(controller) {
        for await (const chunk of response) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            controller.enqueue(chunk.delta.text)
          }
        }
        controller.close()
      },
    })
  }

  async generateEmbedding (value: string): Promise<number[]> {
    throw new Error(`Embedding generation not implemented for Anthropic provider. Cannot generate embedding for: ${value}`);
  }
}
