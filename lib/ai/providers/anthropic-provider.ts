import Anthropic from '@anthropic-ai/sdk'
import { AIProvider } from '../types'
import { StreamingTextResponse } from 'ai'
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
    return response.content[0].text
  }

  async generateStreamingResponse(prompt: string): Promise<ReadableStream> {
    const response = await this.client.messages.create({
      model: AI_MODELS.ANTHROPIC.CLAUDE_SONNET,
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    })
    return new StreamingTextResponse(response)
  }
}
