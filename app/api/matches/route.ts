import { AIProviderFactory } from '@/lib/ai/provider-factory'
import { generateMatchingPrompt } from '@/lib/constants/prompts'
import { EXAMPLE_RESULTS } from '@/lib/constants/exampleResults'
import { COMMUNITY_BIOS } from '@/lib/constants/communityBios'

// Configure which provider to use
const AI_PROVIDER =
  (process.env.AI_PROVIDER as 'anthropic' | 'gemini') || 'anthropic'

// Add this interface before the parseXMLResponse function
interface Match {
  name: string
  reason: string
}

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

export const runtime = 'edge'

export async function POST(req: Request) {
  const requestId = crypto.randomUUID()
  const startTime = Date.now()

  try {
    const body = await req.json()
    const { bio, matchingContext } = body

    // Basic request logging in Vercel
    console.log(
      JSON.stringify({
        requestId,
        type: 'request_received',
        timestamp: new Date().toISOString(),
        bioLength: bio?.length || 0,
        bioPreview: bio?.slice(0, 200) + '...',
        matchingContext: matchingContext?.slice(0, 200) + '...',
      })
    )

    const promptData = generateMatchingPrompt({
      communityBios: COMMUNITY_BIOS,
      newMemberBio: bio || '',
      matchingContext: matchingContext || '',
      exampleResults: EXAMPLE_RESULTS,
    })

    const aiProvider = AIProviderFactory.getProvider(AI_PROVIDER)

    // Log before AI call
    console.log(
      JSON.stringify({
        requestId,
        type: 'ai_request_start',
        timestamp: new Date().toISOString(),
        provider: AI_PROVIDER,
        // Log the first part of the prompt to debug prompt issues
        promptPreview: promptData.slice(0, 500) + '...',
      })
    )

    const responseText = await aiProvider.generateResponse(promptData)

    // Detailed AI response logging
    console.log(
      JSON.stringify({
        requestId,
        type: 'ai_response_received',
        timestamp: new Date().toISOString(),
        responseLength: responseText.length,
        // More context but still truncated
        responseSample: responseText.slice(0, 1000) + '...',
        duration: Date.now() - startTime,
        // Add response structure validation
        hasMatchTags: responseText.includes('<match1>'),
        hasSummaryTag: responseText.includes('<summary>'),
      })
    )

    if (
      responseText.toLowerCase().includes('apologize') ||
      responseText.toLowerCase().includes('could you provide')
    ) {
      // More detailed error logging
      console.log(
        JSON.stringify({
          requestId,
          type: 'matching_error',
          timestamp: new Date().toISOString(),
          error: 'AI apologetic response',
          errorResponse: responseText.slice(0, 500) + '...',
          // Add context about what might have caused the error
          bioLength: bio?.length || 0,
          hasMatchingContext: Boolean(matchingContext),
          duration: Date.now() - startTime,
        })
      )
      return Response.json({ error: responseText, matches: [], summary: '' })
    }

    const formattedResponse = parseXMLResponse(responseText)

    // Comprehensive success logging
    console.log(
      JSON.stringify({
        requestId,
        type: 'matching_success',
        timestamp: new Date().toISOString(),
        matchCount: formattedResponse.matches.length,
        matches: formattedResponse.matches.map((m) => ({
          name: m.name,
          // Longer reason previews
          reasonPreview: m.reason.slice(0, 200) + '...',
          // Add some analytics
          reasonLength: m.reason.length,
          containsKeywords: extractKeywords(m.reason),
        })),
        summaryPreview: formattedResponse.summary.slice(0, 300) + '...',
        duration: Date.now() - startTime,
        // Add performance metrics
        promptLength: promptData.length,
        totalResponseLength: responseText.length,
      })
    )

    return Response.json(formattedResponse)
  } catch (error) {
    console.error('Full error:', error) // This logs to Vercel's error tracking
    console.log(
      JSON.stringify({
        requestId,
        type: 'error',
        timestamp: new Date().toISOString(),
        error: error.message,
        stack: error.stack?.slice(0, 500) + '...',
        duration: Date.now() - startTime,
      })
    )
    return Response.json(
      { error: 'Error processing request', matches: [], summary: '' },
      { status: 500 }
    )
  }
}

// Helper function to extract important keywords
function extractKeywords(text: string): string[] {
  const keywords = ['AI', 'ML', 'startup', 'founder', 'tech', 'research']
  return keywords.filter((word) =>
    text.toLowerCase().includes(word.toLowerCase())
  )
}
