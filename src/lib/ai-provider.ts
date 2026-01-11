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
}

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

  // Google
  'gemini-2.0-flash': { provider: 'google', modelName: 'gemini-2.0-flash' },
  'gemini-2.5-flash': { provider: 'google', modelName: 'gemini-2.5-flash' },
  'gemini-2.5-pro': { provider: 'google', modelName: 'gemini-2.5-pro' },

  // xAI (Grok)
  'grok-4-1-fast': { provider: 'xai', modelName: 'grok-4-1-fast-non-reasoning' },
  'grok-4-fast': { provider: 'xai', modelName: 'grok-4-fast-non-reasoning' },
  'grok-3': { provider: 'xai', modelName: 'grok-3' },
  'grok-3-mini': { provider: 'xai', modelName: 'grok-3-mini' },

  // Ollama
  'codellama-7b': { provider: 'ollama', modelName: 'codellama:7b', baseUrl: 'http://localhost:11434' },
  'phi3-mini': { provider: 'ollama', modelName: 'phi3:mini', baseUrl: 'http://localhost:11434' },
  'llama3.2-3b': { provider: 'ollama', modelName: 'llama3.2:3b', baseUrl: 'http://localhost:11434' },
  'gemma2-2b': { provider: 'ollama', modelName: 'gemma2:2b', baseUrl: 'http://localhost:11434' },

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
      max_tokens: 300,
    }),
  });

  const data = await response.json();
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
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await response.json();
  return data.content?.[0]?.text || '';
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
      }),
    }
  );

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
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
      max_tokens: 300,
    }),
  });

  const data = await response.json();
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

    return parseAIResponse(response);
  } catch (error) {
    console.error(`AI call failed for ${modelId}:`, error);
    return { actions: [], reasoning: `AI error: ${error}` };
  }
}
