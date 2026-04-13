# Rondo Chat (Quatarly)

Webowy chat (frontend + backend) pod API Quatarly (`/chat/completions`) z modelem Claude.

## Wymagania

- Node.js 20+
- Klucz API Quatarly (`qua-...`)

## Szybki start

```bash
npm install
cp .env.example .env
# uzupełnij .env swoim kluczem qua-...
npm start
```

Aplikacja działa na `http://localhost:3000`.

## Ustawienie zmiennych środowiskowych (jak w setup video)

```bash
export ANTHROPIC_API_KEY="your-quatarly-api-key"
export ANTHROPIC_BASE_URL="https://api.quatarly.cloud/v0"
export CHAT_MODEL="claude-sonnet-4-5"
```

## Zmienne środowiskowe

- `ANTHROPIC_API_KEY` (wymagane)
- `ANTHROPIC_BASE_URL` (opcjonalne, domyślnie `https://api.quatarly.cloud/v0`)
- `CHAT_MODEL` (opcjonalne, domyślnie `claude-sonnet-4-5`)
- `PORT` (opcjonalne)

## Endpointy aplikacji

- `GET /api/models` – pobiera listę modeli z Quatarly (`/models`)
- `POST /api/chat` – wysyła historię rozmowy do Quatarly (`/chat/completions`)
- `GET /api/credits` – pobiera saldo kredytów (`/user/credits/:apiKey`)
- `GET /healthz` – healthcheck + informacja czy API key jest skonfigurowany

## Przykłady API (Quatarly)

Chat completion:

```bash
curl https://api.quatarly.cloud/v0/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-sonnet-4-5",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

Check credits:

```bash
curl https://api.quatarly.cloud/v0/user/credits/YOUR_API_KEY \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## Deploy (Railway)

Ustaw w Railway:

- `ANTHROPIC_API_KEY`
- `ANTHROPIC_BASE_URL=https://api.quatarly.cloud/v0`
- `CHAT_MODEL=claude-sonnet-4-5` (lub inny wspierany)

Start command:

```bash
npm start
```
