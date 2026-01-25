/**
 * AI module exports
 */

export { getAnthropicClient, isAnthropicConfigured } from './client';
export { MEMO_SYSTEM_PROMPT, buildMemoUserPrompt, buildComparisonPrompt } from './prompts';
export { generateMemoNarrative, generateComparisonNarrative } from './narrative';
export type { MemoNarrative } from './narrative';
