import { AnthropicStream, StreamingTextResponse } from 'ai'
import Anthropic from '@anthropic-ai/sdk'
import { generateMatchingPrompt } from '@/lib/constants/prompts'
import { COMMUNITY_BIOS } from '@/lib/constants/communityBios'
import { MOCK_RESPONSE } from '@/lib/constants/mockResponse'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: Request) {
  try {
    return new Response(MOCK_RESPONSE)
    const { prompt } = await req.json()
    const { bio, matchingContext } = JSON.parse(prompt)

    const promptData = generateMatchingPrompt({
      communityBios: COMMUNITY_BIOS,
      newMemberBio: bio,
      matchingContext: matchingContext || '',
    })

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4096,
      messages: [{ role: 'user', content: promptData }],
      stream: true,
    })

    const stream = AnthropicStream(response)
    return new StreamingTextResponse(stream)
  } catch (error) {
    console.error('Error:', error)
    return new Response('Error processing request', { status: 500 })
  }
}
