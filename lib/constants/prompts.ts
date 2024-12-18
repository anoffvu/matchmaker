export const MATCHING_PROMPT = `You are an AI assistant tasked with matching members in a founder community called South Park Commons. This community is for founders and individuals exploring potential startup ideas in the "negative 1-to-0" phase, meaning they are still in the early stages of ideation and exploration.

Read the bio of the new community member:

<new_member_name>
{{MEMBER_NAME}}
<new_member_name>

<new_member_bio>
{{NEW_MEMBER_BIO}}
</new_member_bio>

Optional: If provided, consider the specific matching context for this new member:

<matching_context>
{{MATCHING_CONTEXT}}
</matching_context>

Your tasks:
1. Categorize the new member's key attributes, experiences, and interests.
2. List potential matching criteria based on the new member's profile.

After your analysis, provide your recommendations in the following valid xml format:

<matching_analysis>
<summary>
Provide a brief summary (2-3 sentences) explaining the overall traits of the new community member along with keywords related to their preferred matching criteria . If a specific matching context was provided, align your recommendations with that context as text only.
</summary>
<key_attributes>
Give detailed information about the person including their technical background, current focus, values, interests, what they are looking for, their experience and any matching criteria that they mentioned as text only
</key_attributes>
<match_reason>
mention why this person might be a good match for someone else. Use their first name for this section of the analysis.
</match_reason>
</matching_analysis>
`;

export const SIMILARITIES_PROMPT = `Consider this user object: """{{USER_OBJECT}}""".
for each of the user objects in the following JSON array, add another field "similarities" with valid html of "<li>" bullet points of at least 3 common topics of interest and values similar to the current user: """{{POTENTIAL_MATCHES}}""". Return the updated JSON array with the new "similarities" field without adding any other text or any new keys.`;

// Define the parameters that need to be injected
export interface MatchingPromptParams {
  newMemberBio: string;
  newMemberName: string;
  matchingContext?: string;
}

// Helper function to inject parameters into the prompt
export function generateMatchingPrompt({
  newMemberBio,
  newMemberName,
  matchingContext = "",
}: MatchingPromptParams): string {
  const matchingPrompt = MATCHING_PROMPT.replace(
    "{{NEW_MEMBER_BIO}}",
    newMemberBio
  )
    .replace("{{MATCHING_CONTEXT}}", matchingContext)
    .replace("{{MEMBER_NAME}}", newMemberName);
  return matchingPrompt;
}

export function generateSimilaritiesPrompt({
  potentialMatches,
  name,
  bio,
}: {
  potentialMatches: string;
  name: string;
  bio: string;
}): string {
  return SIMILARITIES_PROMPT.replace(
    "{{POTENTIAL_MATCHES}}",
    JSON.stringify(potentialMatches)
  ).replace("{{USER_OBJECT}}", JSON.stringify({ name, bio }));
}
