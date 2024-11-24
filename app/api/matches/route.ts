import { Anthropic } from '@anthropic-ai/sdk'
import { generateMatchingPrompt } from '@/lib/constants/prompts'
import { EXAMPLE_RESULTS } from '@/lib/constants/exampleResults'
import { COMMUNITY_BIOS } from '@/lib/constants/communityBios'

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

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      temperature: 0.3,
      messages: [{ role: 'user', content: promptData }],
      stream: false,
    })

    // Debug log the raw response
    console.log('Raw AI response:', response.content[0].text)

    const responseText = response.content[0].text
    console.log('Raw AI response:', responseText)

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
