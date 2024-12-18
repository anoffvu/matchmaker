import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/users";
import { getAIProvider } from "@/lib/ai/provider-factory";
import { sleep } from "@/lib/utils";
import { generateMatchingPrompt } from "@/lib/constants/prompts";

// Adjust batch size and delays based on 15 RPM limit
const EMBEDDING_BATCH_SIZE = 5; // Process 5 at a time
const DELAY_BETWEEN_REQUESTS = 4000; // 4 seconds between requests (15 RPM = 1 request per 4 seconds)

// Add this interface at the top of the file
interface ProfileData {
  name: string;
  bio: string;
  matchingContext: string;
  matchReason?: string;
  attributes?: string[];
}

function parseXMLResponse(text: string) {
  const keyAttributesText = /<key_attributes>(.*?)<\/key_attributes>/s.exec(text);
  const keyAttributes = keyAttributesText ? keyAttributesText[1].trim() : "";

  const matchreasonText = /<match_reason>(.*?)<\/match_reason>/s.exec(text);
  const matchreason = matchreasonText && matchreasonText[1].trim() !== "" ? matchreasonText[1] : "";

  return { keyAttributes, matchreason };
}

export async function POST(req: Request) {
  try {
    const profiles = await req.json();
    const provider = getAIProvider();
    const allEmbeddings: number[][] = [];
    const enrichedProfiles: ProfileData[] = [];

    // Process profiles in smaller batches with delays
    for (let i = 0; i < profiles.length; i += EMBEDDING_BATCH_SIZE) {
      const batchProfiles = profiles.slice(i, i + EMBEDDING_BATCH_SIZE);

      for (const profile of batchProfiles) {
        try {
          // Generate embedding
          const embedding = await provider.generateEmbedding(profile.matchingContext);
          allEmbeddings.push(embedding);

          // Generate attributes and match reason
          const promptData = generateMatchingPrompt({
            newMemberBio: profile.bio,
            newMemberName: profile.name,
            matchingContext: profile.matchingContext,
          });

          const responseText = await provider.generateResponse(promptData);
          const { keyAttributes, matchreason } = parseXMLResponse(responseText);

          enrichedProfiles.push({
            ...profile,
            attributes: keyAttributes.split(',').map(attr => attr.trim()),
            matchReason: matchreason
          });

          // Add delay between requests
          await sleep(DELAY_BETWEEN_REQUESTS);
        } catch (error) {
          console.error('Processing failed for profile:', profile.name, error);
          throw new Error(`Failed to process profile ${profile.name}`);
        }
      }

      // Log progress
      console.log(`Processed ${enrichedProfiles.length}/${profiles.length} profiles`);
    }

    // Insert all profiles with their embeddings
    await db.insert(users).values(
      enrichedProfiles.map((profile: ProfileData, index: number) => ({
        name: profile.name,
        bio: profile.bio,
        matchingContext: profile.matchingContext,
        embedding: allEmbeddings[index],
        matchreason: profile.matchReason || null,
        attributes: profile.attributes?.join(',') || '',
      }))
    );

    return NextResponse.json({ 
      success: true, 
      count: profiles.length,
      embeddingsGenerated: allEmbeddings.length 
    });

  } catch (error) {
    console.error('Batch processing error:', error);
    return NextResponse.json(
      { error: "Failed to process batch: " + (error as Error).message },
      { status: 500 }
    );
  }
} 