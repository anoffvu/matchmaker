import { AIProviderFactory } from "@/lib/ai/provider-factory";

const AI_PROVIDER = "gemini"; // Anthropic does not offer an embedding model right now. https://docs.anthropic.com/en/docs/build-with-claude/embeddings
const aiProvider = AIProviderFactory.getProvider(AI_PROVIDER);

export const getEmbeddings = async (userProfile: string) => {
  try {
    const res = await aiProvider.generateEmbedding(userProfile);
    return res;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
