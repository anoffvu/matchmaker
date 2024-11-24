import { AIModelProvider, AIProvider } from './types'
import { AnthropicProvider } from './providers/anthropic-provider'
import { GeminiProvider } from './providers/gemini-provider'

export class AIProviderFactory {
  static getProvider(provider: AIModelProvider): AIProvider {
    switch (provider) {
      case 'anthropic':
        return new AnthropicProvider()
      case 'gemini':
        return new GeminiProvider()
      default:
        throw new Error(`Unsupported AI provider: ${provider}`)
    }
  }
}
