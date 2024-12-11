import { AIProviderFactory } from "@/lib/ai/provider-factory";
import {
  generateMatchingPrompt,
  generateSimilaritiesPrompt,
} from "@/lib/constants/prompts";
import { processProfileAndFindMatches } from "@/lib/actions/users";

// Configure which provider to use
const AI_PROVIDER =
  (process.env.AI_PROVIDER as "anthropic" | "gemini") || "anthropic";

function parseXMLResponse(text: string) {
  // Extract summary
  const summaryText = /<summary>(.*?)<\/summary>/s.exec(text);
  const summary = summaryText ? summaryText[1].trim() : "";

  const keyAttributesText = /<key_attributes>(.*?)<\/key_attributes>/s.exec(
    text
  );
  const keyAttributes = keyAttributesText ? keyAttributesText[1].trim() : "";

  const matchreasonText = /<match_reason>(.*?)<\/match_reason>/s.exec(text);
  const matchreason =
    matchreasonText && matchreasonText[1].trim() !== ""
      ? matchreasonText[1]
      : "";

  return {
    summary,
    keyAttributes,
    matchreason,
  };
}

// export const runtime = "edge";

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  try {
    const body = await req.json();
    const { bio, matchingContext, name } = body;

    // Basic request logging in Vercel
    console.log(
      JSON.stringify({
        requestId,
        type: "request_received",
        timestamp: new Date().toISOString(),
        bioLength: bio?.length || 0,
        bioPreview: bio?.slice(0, 200) + "...",
        matchingContext: matchingContext?.slice(0, 200) + "...",
      })
    );

    const promptData = generateMatchingPrompt({
      newMemberBio: bio || "",
      newMemberName: name || "",
      matchingContext: matchingContext || "",
    });

    const aiProvider = AIProviderFactory.getProvider(AI_PROVIDER);

    // Log before AI call
    console.log(
      JSON.stringify({
        requestId,
        type: "ai_request_start",
        timestamp: new Date().toISOString(),
        provider: AI_PROVIDER,
        // Log the first part of the prompt to debug prompt issues
        promptPreview: promptData.slice(0, 500) + "...",
      })
    );

    const responseText = await aiProvider.generateResponse(promptData);

    // Detailed AI response logging
    console.log(
      JSON.stringify({
        requestId,
        type: "ai_response_received",
        timestamp: new Date().toISOString(),
        responseLength: responseText.length,
        // More context but still truncated
        responseSample: responseText.slice(0, 1000) + "...",
        duration: Date.now() - startTime,
        // Add response structure validation
        hasMatchTags: responseText.includes("<match1>"),
        hasSummaryTag: responseText.includes("<summary>"),
      })
    );

    if (
      responseText.toLowerCase().includes("apologize") ||
      responseText.toLowerCase().includes("could you provide")
    ) {
      // More detailed error logging
      console.log(
        JSON.stringify({
          requestId,
          type: "matching_error",
          timestamp: new Date().toISOString(),
          error: "AI apologetic response",
          errorResponse: responseText.slice(0, 500) + "...",
          // Add context about what might have caused the error
          bioLength: bio?.length || 0,
          hasMatchingContext: Boolean(matchingContext),
          duration: Date.now() - startTime,
        })
      );
      return Response.json({ error: responseText, matches: [], summary: "" });
    }

    const formattedResponse = parseXMLResponse(responseText);

    // Comprehensive success logging
    console.log(
      JSON.stringify({
        requestId,
        type: "matching_success",
        timestamp: new Date().toISOString(),
        summaryPreview: formattedResponse.summary.slice(0, 300) + "...",
        duration: Date.now() - startTime,
        // Add performance metrics
        promptLength: promptData.length,
        totalResponseLength: responseText.length,
      })
    );

    console.log(
      JSON.stringify({
        requestId,
        type: "profile_request",
        timestamp: new Date().toISOString(),
        payload: {
          bio: formattedResponse.summary,
          attributes: formattedResponse.keyAttributes,
          name,
          matchreason: formattedResponse.matchreason,
        }
      })
    );
    const profileResponseData = await processProfileAndFindMatches({
      bio: formattedResponse.summary,
      attributes: formattedResponse.keyAttributes,
      name,
      matchreason: formattedResponse.matchreason,
    });

    console.log(
      JSON.stringify({
        requestId,
        type: "profile_response",
        timestamp: new Date().toISOString(),
        profileResponseData
      })
    );

    const { matches: potentialMatches } = profileResponseData;

    const matchesWithSimilarities = JSON.parse(
      await aiProvider.generateResponse(
        generateSimilaritiesPrompt({ potentialMatches, name, bio }),
        "json"
      )
    );

    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        matchResults: potentialMatches,
      })
    );

    return Response.json({
      success: true,
      matches: matchesWithSimilarities,
    });
  } catch (error) {
    console.error("Full error:", error); // This logs to Vercel's error tracking
    console.log(
      JSON.stringify({
        requestId,
        type: "error",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
        stack:
          error instanceof Error
            ? error.stack?.slice(0, 500) + "..."
            : "No stack available",
        duration: Date.now() - startTime,
      })
    );
    return Response.json(
      { error: "Error processing request", matches: [], summary: "" },
      { status: 500 }
    );
  }
}
