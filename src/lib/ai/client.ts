/**
 * Anthropic Claude API client
 */

import Anthropic from '@anthropic-ai/sdk';

let client: Anthropic | null = null;

/**
 * Get or create the Anthropic client
 * Uses lazy initialization to avoid issues during build
 */
export function getAnthropicClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set');
    }

    client = new Anthropic({
      apiKey,
    });
  }

  return client;
}

/**
 * Check if the Anthropic API is configured
 */
export function isAnthropicConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}
