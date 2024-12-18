import { getAIProvider } from "@/lib/ai/provider-factory";

const aiProvider = getAIProvider();

export const getEmbeddings = async (userProfile: string) => {
  try {
    const res = await aiProvider.generateEmbedding(userProfile);
    return res;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
