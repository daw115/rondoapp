import 'dotenv/config';
import express from 'express';

const app = express();
const port = Number(process.env.PORT || 3000);

function readConfig() {
  return {
    baseUrl: process.env.ANTHROPIC_BASE_URL || 'https://api.quatarly.cloud/v0',
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    defaultModel: process.env.CHAT_MODEL || 'claude-sonnet-4-5',
  };
}

function normalizeMessages(messages) {
  const allowedRoles = new Set(['system', 'user', 'assistant']);

  return messages
    .filter((message) => message && typeof message === 'object')
    .map((message) => ({
      role: allowedRoles.has(message.role) ? message.role : 'user',
      content: String(message.content ?? '').trim(),
    }))
    .filter((message) => message.content.length > 0);
}

function networkErrorMessage(error) {
  return error?.cause?.code || error?.code || error?.message || 'network failure';
}

async function quatarlyFetch(path, options = {}) {
  const { baseUrl, apiKey } = readConfig();

  if (!apiKey) {
    return { status: 500, payload: { error: 'Server is missing ANTHROPIC_API_KEY' } };
  }

  try {
    const mergedHeaders = {
      Authorization: `Bearer ${apiKey}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    };

    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: mergedHeaders,
    });

    const payload = await response.json().catch(() => ({}));
    return { status: response.status, ok: response.ok, payload };
  } catch (error) {
    return {
      status: 502,
      payload: { error: `Quatarly API network error: ${networkErrorMessage(error)}` },
    };
  }
}

app.use(express.json({ limit: '1mb' }));
app.use(express.static('public'));

app.get('/api/models', async (_req, res) => {
  const upstream = await quatarlyFetch('/models', { method: 'GET' });

  if (!upstream.ok) {
    return res.status(upstream.status).json(upstream.payload);
  }

  return res.json(upstream.payload);
});

app.post('/api/chat', async (req, res) => {
  const { messages, model } = req.body ?? {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages must be a non-empty array' });
  }

  const normalizedMessages = normalizeMessages(messages);

  if (normalizedMessages.length === 0) {
    return res.status(400).json({ error: 'messages cannot be empty after normalization' });
  }

  const { defaultModel } = readConfig();
  const selectedModel = typeof model === 'string' && model.trim() ? model.trim() : defaultModel;

  const upstream = await quatarlyFetch('/chat/completions', {
    method: 'POST',
    body: JSON.stringify({ model: selectedModel, messages: normalizedMessages }),
  });

  if (!upstream.ok) {
    const upstreamMessage = upstream.payload?.error?.message || upstream.payload?.error || 'Upstream API error';
    const message = upstream.status === 500 ? upstreamMessage : `Quatarly API error: ${upstreamMessage}`;
    return res.status(upstream.status).json({ error: message });
  }

  const text = upstream.payload?.choices?.[0]?.message?.content?.trim();

  if (!text) {
    return res.status(502).json({ error: 'Model returned an empty response' });
  }

  return res.json({
    reply: text,
    usage: upstream.payload?.usage ?? null,
    model: selectedModel,
  });
});

app.get('/api/credits', async (_req, res) => {
  const { apiKey } = readConfig();
  const upstream = await quatarlyFetch(`/user/credits/${apiKey}`, { method: 'GET' });

  if (!upstream.ok) {
    return res.status(upstream.status).json(upstream.payload);
  }

  return res.json(upstream.payload);
});

app.get('/healthz', (_req, res) => {
  const { baseUrl, defaultModel, apiKey } = readConfig();
  res.json({ ok: true, defaultModel, baseUrl, configured: Boolean(apiKey) });
});

if (import.meta.url === `file://${process.argv[1]}`) {
  app.listen(port, () => {
    const { apiKey } = readConfig();
    if (!apiKey) {
      console.warn('ANTHROPIC_API_KEY is not set. Chat endpoint will return an error until it is configured.');
    }
    console.log(`Server listening on http://localhost:${port}`);
  });
}

export { app, normalizeMessages, networkErrorMessage };
