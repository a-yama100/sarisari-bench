// AI Provider integration for Sarisari-Bench
import { DayState } from './simulation/types';
import { PRODUCTS } from './simulation/products';

export interface AIDecision {
  actions: { type: 'buy'; productId: string; quantity: number }[];
  reasoning?: string;
}

interface ModelConfig {
  provider: 'openai' | 'anthropic' | 'google' | 'ollama' | 'lmstudio' | 'xai';
  modelName: string;
  apiKey?: string;
  baseUrl?: string;
  // Output cap. Defaults to 300; models that cannot fully turn thinking off need more room.
  maxTokens?: number;
  // Provider-specific request fields (thinking / reasoning settings).
  extra?: Record<string, unknown>;
}

// Thrown when the API itself fails (HTTP error, no credits, empty reply).
// The run is aborted instead of being recorded as a model that "did nothing".
export class AIProviderError extends Error {}

const MODEL_CONFIGS: Record<string, ModelConfig> = {
  // OpenAI
  'gpt-4o': { provider: 'openai', modelName: 'gpt-4o' },
  'gpt-4o-mini': { provider: 'openai', modelName: 'gpt-4o-mini' },
  'gpt-4.1-mini': { provider: 'openai', modelName: 'gpt-4.1-mini' },
  'gpt-4.1': { provider: 'openai', modelName: 'gpt-4.1' },

  // Anthropic
  'claude-sonnet-4': { provider: 'anthropic', modelName: 'claude-sonnet-4-20250514' },
  'claude-haiku-3.5': { provider: 'anthropic', modelName: 'claude-3-5-haiku-20241022' },
  'claude-opus-4': { provider: 'anthropic', modelName: 'claude-opus-4-20250514' },
  // Claude 5 family (2026-10). Haiku/Sonnet can turn thinking off; Opus 5.5 and Fable 5.1 cannot, so they run at the lowest effort.
  'claude-haiku-5.5': { provider: 'anthropic', modelName: 'claude-haiku-5-5', extra: { thinking: { type: 'disabled' } } },
  'claude-sonnet-5.5': { provider: 'anthropic', modelName: 'claude-sonnet-5-5', extra: { thinking: { type: 'between_tools' } } },
  'claude-opus-5.5': { provider: 'anthropic', modelName: 'claude-opus-5-5', maxTokens: 2000, extra: { output_config: { effort: 'low' } } },
  'claude-fable-5.1': { provider: 'anthropic', modelName: 'claude-fable-5-1', maxTokens: 2000, extra: { output_config: { effort: 'low' } } },

  // Google
  'gemini-2.0-flash': { provider: 'google', modelName: 'gemini-2.0-flash' },
  'gemini-2.5-flash': { provider: 'google', modelName: 'gemini-2.5-flash' },
  'gemini-2.5-pro': { provider: 'google', modelName: 'gemini-2.5-pro' },
  // Gemini 3.x (2026-10). 3.8 Flash can turn thinking off; 3.1 Pro only runs in thinking mode, so it uses the lowest level.
  // maxTokens 1000: at 300 its replies were cut off mid-JSON (finishReason MAX_TOKENS) on about half the days.
  'gemini-3.8-flash': { provider: 'google', modelName: 'gemini-3.8-flash', maxTokens: 1000, extra: { thinkingConfig: { thinkingBudget: 0 } } },
  'gemini-3.1-pro': { provider: 'google', modelName: 'gemini-3.1-pro-preview', maxTokens: 4000, extra: { thinkingConfig: { thinkingLevel: 'low' } } },

  // xAI (Grok)
  'grok-4-1-fast': { provider: 'xai', modelName: 'grok-4-1-fast-non-reasoning' },
  'grok-4-fast': { provider: 'xai', modelName: 'grok-4-fast-non-reasoning' },
  'grok-3': { provider: 'xai', modelName: 'grok-3' },
  'grok-3-mini': { provider: 'xai', modelName: 'grok-3-mini' },
  // Grok 4.x (2026-10). 4.3 can turn reasoning off; 4.7 always reasons (no reasoning_effort setting).
  'grok-4.3': { provider: 'xai', modelName: 'grok-4.3', extra: { reasoning_effort: 'none' } },
  'grok-4.7': { provider: 'xai', modelName: 'grok-4.7', maxTokens: 2000 },

  // Ollama
  'codellama-7b': { provider: 'ollama', modelName: 'codellama:7b', baseUrl: 'http://localhost:11434' },
  'phi3-mini': { provider: 'ollama', modelName: 'phi3:mini', baseUrl: 'http://localhost:11434' },
  'llama3.2-3b': { provider: 'ollama', modelName: 'llama3.2:3b', baseUrl: 'http://localhost:11434' },
  'gemma2-2b': { provider: 'ollama', modelName: 'gemma2:2b', baseUrl: 'http://localhost:11434' },
  'deepseek-r1-7b': { provider: 'ollama', modelName: 'deepseek-r1:7b', baseUrl: 'http://localhost:11434' },
  'deepseek-r1-8b': { provider: 'ollama', modelName: 'deepseek-r1:8b', baseUrl: 'http://localhost:11434' },
  'qwen2.5-coder-7b': { provider: 'ollama', modelName: 'qwen2.5-coder:7b', baseUrl: 'http://localhost:11434' },
  'lfm2.5-thinking': { provider: 'ollama', modelName: 'lfm2.5-thinking:latest', baseUrl: 'http://localhost:11434' },

  // LM Studio
  'lmstudio-llama3.2-1b': { provider: 'lmstudio', modelName: 'llama-3.2-1b-instruct', baseUrl: 'http://localhost:1234' },
  'lmstudio-gemma3n': { provider: 'lmstudio', modelName: 'google/gemma-3n-e4b', baseUrl: 'http://localhost:1234' },

  // Fallback
  'llama-3-70b': { provider: 'ollama', modelName: 'llama3:70b', baseUrl: 'http://localhost:11434' },
};

function buildPrompt(state: DayState, day: number, totalDays: number): string {
  const topProducts = PRODUCTS
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 8)
    .map(p => `- ${p.id}: cost ${p.costPrice}, sell ${p.sellPrice}, profit ${p.sellPrice - p.costPrice}, shelf ${p.shelfLife}d, popularity ${p.popularity}`)
    .join('\n');

  const inventoryList = state.inventory.length > 0
    ? state.inventory.map(i => `- ${i.productId}: ${i.quantity} units (expires day ${i.expiryDay})`).join('\n')
    : '- Empty';

  const totalInventory = state.inventory.reduce((sum, i) => sum + i.quantity, 0);

  return `You manage a sari-sari store. Goal: maximize cash by day ${totalDays}.

DAY ${day}/${totalDays} | Cash: ${state.cash} PHP | Weather: ${state.weather} | Inventory items: ${totalInventory}

INVENTORY:
${inventoryList}

TOP PRODUCTS (by popularity):
${topProducts}

CRITICAL RULES:
- Customers buy automatically each day based on your inventory
- Products EXPIRE and become worthless after shelf life
- Weather: sunny=120% sales, cloudy=100%, rainy=70%, typhoon=30%
- Keep at least 1000 PHP cash reserve for safety
- Buy small quantities (5-15 units) of high-popularity items
- If inventory > 50 items, consider NOT buying

STRATEGY TIPS:
- High popularity items sell faster (less expiry risk)
- Short shelf life items are risky
- Near end of simulation (day 25+), stop buying

Respond ONLY with valid JSON:
{"actions": [{"type": "buy", "productId": "id", "quantity": N}], "reasoning": "brief"}

To skip buying: {"actions": [], "reasoning": "reason"}`;
}

async function readJson(response: Response, provider: string) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.error?.message || JSON.stringify(data).slice(0, 300);
    throw new AIProviderError(`${provider} HTTP ${response.status}: ${message}`);
  }
  return data;
}

async function callOpenAI(prompt: string, config: ModelConfig): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not set');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: config.modelName,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: config.maxTokens ?? 300,
      ...config.extra,
    }),
  });

  const data = await readJson(response, 'OpenAI');
  return data.choices?.[0]?.message?.content || '';
}

async function callAnthropic(prompt: string, config: ModelConfig): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: config.modelName,
      max_tokens: config.maxTokens ?? 300,
      messages: [{ role: 'user', content: prompt }],
      ...config.extra,
    }),
  });

  const data = await readJson(response, 'Anthropic');
  // Models that think return a thinking block before the text block.
  const textBlock = (data.content || []).find((b: { type: string }) => b.type === 'text');
  return textBlock?.text || '';
}

async function callGoogle(prompt: string, config: ModelConfig): Promise<string> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error('GOOGLE_API_KEY not set');

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${config.modelName}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        // Without a cap, Gemini's thinking tokens are unbounded (and billed).
        generationConfig: { maxOutputTokens: config.maxTokens ?? 300, ...config.extra },
      }),
    }
  );

  const data = await readJson(response, 'Google');
  const parts: { text?: string; thought?: boolean }[] = data.candidates?.[0]?.content?.parts || [];
  return parts.filter(p => !p.thought && p.text).map(p => p.text).join('');
}

async function callXAI(prompt: string, config: ModelConfig): Promise<string> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) throw new Error('XAI_API_KEY not set');

  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: config.modelName,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: config.maxTokens ?? 300,
      ...config.extra,
    }),
  });

  const data = await readJson(response, 'xAI');
  return data.choices?.[0]?.message?.content || '';
}

async function callOllama(prompt: string, config: ModelConfig): Promise<string> {
  const baseUrl = config.baseUrl || 'http://localhost:11434';

  const response = await fetch(`${baseUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.modelName,
      prompt: prompt,
      stream: false,
    }),
  });

  const data = await response.json();
  return data.response || '';
}

async function callLMStudio(prompt: string, config: ModelConfig): Promise<string> {
  const baseUrl = config.baseUrl || 'http://localhost:1234';

  const response = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.modelName,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 300,
    }),
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

function parseAIResponse(response: string): AIDecision {
  try {
    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = response;
    if (response.includes('```')) {
      const match = response.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) jsonStr = match[1];
    }

    const parsed = JSON.parse(jsonStr.trim());

    // Validate actions
    const validActions = (parsed.actions || []).filter((a: { type: string; productId: string; quantity: number }) =>
      a.type === 'buy' &&
      typeof a.productId === 'string' &&
      typeof a.quantity === 'number' &&
      a.quantity > 0 &&
      a.quantity <= 20 &&
      PRODUCTS.some(p => p.id === a.productId)
    );

    return {
      actions: validActions,
      reasoning: parsed.reasoning || '',
    };
  } catch {
    // Fallback to no actions if parsing fails
    return { actions: [], reasoning: 'Failed to parse AI response' };
  }
}

export async function getAIDecision(
  modelId: string,
  state: DayState,
  day: number,
  totalDays: number
): Promise<AIDecision> {
  const config = MODEL_CONFIGS[modelId];

  if (!config) {
    console.warn(`Unknown model: ${modelId}, using random strategy`);
    return { actions: [], reasoning: 'Unknown model' };
  }

  const prompt = buildPrompt(state, day, totalDays);

  try {
    let response: string;

    switch (config.provider) {
      case 'openai':
        response = await callOpenAI(prompt, config);
        break;
      case 'anthropic':
        response = await callAnthropic(prompt, config);
        break;
      case 'google':
        response = await callGoogle(prompt, config);
        break;
      case 'xai':
        response = await callXAI(prompt, config);
        break;
      case 'ollama':
        response = await callOllama(prompt, config);
        break;
      case 'lmstudio':
        response = await callLMStudio(prompt, config);
        break;
      default:
        return { actions: [], reasoning: 'Unsupported provider' };
    }

    if (!response.trim()) {
      throw new AIProviderError(`${modelId}: empty response`);
    }
    return parseAIResponse(response);
  } catch (error) {
    console.error(`AI call failed for ${modelId}:`, error);
    // API failures abort the run; recording them as "no purchase" made broken runs look valid.
    if (error instanceof AIProviderError) throw error;
    throw new AIProviderError(`${modelId}: ${error}`);
  }
}
