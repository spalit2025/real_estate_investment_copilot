/**
 * AI Narrative generation for investment memos
 */

import { getAnthropicClient, isAnthropicConfigured } from './client';
import { MEMO_SYSTEM_PROMPT, buildMemoUserPrompt, buildComparisonPrompt } from './prompts';
import type { Deal } from '@/types/deal';
import type { ModelOutput } from '@/types/model';

/**
 * Generated narrative sections
 */
export interface MemoNarrative {
  executiveSummary: string;
  investmentHighlights: string[];
  keyConcerns: string[];
  sensitivityInsights: string;
  recommendation: string;
  fullText: string;
  generatedAt: Date;
}

/**
 * Parse the AI response into structured sections
 */
function parseNarrativeResponse(text: string): MemoNarrative {
  const sections: MemoNarrative = {
    executiveSummary: '',
    investmentHighlights: [],
    keyConcerns: [],
    sensitivityInsights: '',
    recommendation: '',
    fullText: text,
    generatedAt: new Date(),
  };

  // Extract Executive Summary
  const execMatch = text.match(/\*\*Executive Summary\*\*[:\s]*([\s\S]*?)(?=\*\*|$)/i);
  if (execMatch) {
    sections.executiveSummary = execMatch[1].trim();
  }

  // Extract Investment Highlights (bullet points)
  const highlightsMatch = text.match(/\*\*Investment Highlights\*\*[:\s]*([\s\S]*?)(?=\*\*|$)/i);
  if (highlightsMatch) {
    sections.investmentHighlights = highlightsMatch[1]
      .split('\n')
      .filter((line) => line.trim().startsWith('-') || line.trim().startsWith('•'))
      .map((line) => line.replace(/^[-•]\s*/, '').trim())
      .filter((line) => line.length > 0);
  }

  // Extract Key Concerns (bullet points)
  const concernsMatch = text.match(/\*\*Key Concerns\*\*[:\s]*([\s\S]*?)(?=\*\*|$)/i);
  if (concernsMatch) {
    sections.keyConcerns = concernsMatch[1]
      .split('\n')
      .filter((line) => line.trim().startsWith('-') || line.trim().startsWith('•'))
      .map((line) => line.replace(/^[-•]\s*/, '').trim())
      .filter((line) => line.length > 0);
  }

  // Extract Sensitivity Insights
  const sensitivityMatch = text.match(/\*\*Sensitivity Insights\*\*[:\s]*([\s\S]*?)(?=\*\*|$)/i);
  if (sensitivityMatch) {
    sections.sensitivityInsights = sensitivityMatch[1].trim();
  }

  // Extract Recommendation
  const recoMatch = text.match(/\*\*Recommendation\*\*[:\s]*([\s\S]*?)(?=\*\*|$)/i);
  if (recoMatch) {
    sections.recommendation = recoMatch[1].trim();
  }

  return sections;
}

/**
 * Generate narrative for a single deal memo
 */
export async function generateMemoNarrative(
  deal: Deal,
  modelOutput: ModelOutput,
  verdict: 'buy' | 'skip' | 'watch',
  verdictReason: string
): Promise<MemoNarrative> {
  if (!isAnthropicConfigured()) {
    throw new Error('Anthropic API is not configured. Set ANTHROPIC_API_KEY environment variable.');
  }

  const client = getAnthropicClient();
  const userPrompt = buildMemoUserPrompt(deal, modelOutput, verdict, verdictReason);

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    system: MEMO_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: userPrompt,
      },
    ],
  });

  // Extract text from response
  const textContent = response.content.find((block) => block.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text content in AI response');
  }

  return parseNarrativeResponse(textContent.text);
}

/**
 * Generate comparison narrative for multiple deals
 */
export async function generateComparisonNarrative(
  deals: Array<{
    deal: Deal;
    modelOutput: ModelOutput;
    verdict: 'buy' | 'skip' | 'watch';
  }>
): Promise<string> {
  if (!isAnthropicConfigured()) {
    throw new Error('Anthropic API is not configured. Set ANTHROPIC_API_KEY environment variable.');
  }

  const client = getAnthropicClient();
  const userPrompt = buildComparisonPrompt(deals);

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system: MEMO_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: userPrompt,
      },
    ],
  });

  const textContent = response.content.find((block) => block.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text content in AI response');
  }

  return textContent.text;
}
