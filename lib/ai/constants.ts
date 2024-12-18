export const AI_MODELS = {
  ANTHROPIC: {
    CLAUDE_SONNET: "claude-3-5-sonnet-20241022",
    CLAUDE_HAIKU: "claude-3-5-haiku-20241022",
  },
  GEMINI: {
    PRO: "gemini-1.5-pro",
    FLASH: "gemini-1.5-flash",
    FLASH_8B: "gemini-1.5-flash-8b",
    EMBEDDING: "text-embedding-004",
  },
  OPENAI: {
    GPT_4_TURBO: "gpt-4-turbo",
    EMBEDDING: "text-embedding-3-small",
  },
} as const;
