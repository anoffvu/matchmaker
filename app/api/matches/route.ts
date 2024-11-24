import { AIProviderFactory } from '@/lib/ai/provider-factory'
import { generateMatchingPrompt } from '@/lib/constants/prompts'
import { EXAMPLE_RESULTS } from '@/lib/constants/exampleResults'
import { COMMUNITY_BIOS } from '@/lib/constants/communityBios'

// Configure which provider to use
const AI_PROVIDER =
  (process.env.AI_PROVIDER as 'anthropic' | 'gemini') || 'anthropic'

function parseXMLResponse(text: string) {
  const matches: Match[] = []

  // Extract matches
  const matchRegex =
    /<match\d+>\s*<name>(.*?)<\/name>\s*<reason>(.*?)<\/reason>\s*<\/match\d+>/gs
  let match
  while ((match = matchRegex.exec(text)) !== null) {
    matches.push({
      name: match[1].trim(),
      reason: match[2].trim(),
    })
  }

  // Extract summary
  const summaryMatch = /<summary>(.*?)<\/summary>/s.exec(text)
  const summary = summaryMatch ? summaryMatch[1].trim() : ''

  return {
    matches,
    summary,
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { bio, matchingContext } = body

    const promptData = generateMatchingPrompt({
      communityBios: COMMUNITY_BIOS,
      newMemberBio: bio || '',
      matchingContext: matchingContext || '',
      exampleResults: EXAMPLE_RESULTS,
    })

    // Get the configured provider
    const aiProvider = AIProviderFactory.getProvider('anthropic')

    // Use the provider to generate a response
    const responseText = await aiProvider.generateResponse(promptData)

    console.log('Raw AI response:', responseText)

    // Check if the response contains apologetic messages
    if (
      responseText.toLowerCase().includes('apologize') ||
      responseText.toLowerCase().includes('could you provide')
    ) {
      return Response.json({
        error: responseText,
        matches: [],
        summary: '',
      })
    }

    const formattedResponse = parseXMLResponse(responseText)
    return Response.json(formattedResponse)
  } catch (error) {
    console.error('API Error:', error)
    return Response.json(
      { error: 'Error processing request', matches: [], summary: '' },
      { status: 500 }
    )
  }
}
