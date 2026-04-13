# Rondo Chat (Quatarly)

Webowy chat (frontend + backend) pod API Quatarly (`/chat/completions`) z modelem Claude.

## Wymagania

- Node.js 20+
- Klucz API Quatarly (`qua-...`)

## Szybki start lokalny

```bash
npm install
cp .env.example .env
# uzupełnij .env swoim kluczem qua-...
npm start
```

Aplikacja działa lokalnie na `http://localhost:3000`.

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

## Wystawienie online (Railway)

Repo jest gotowy pod deploy (dodany `railway.json` + zdrowie `/healthz`).

1. Wrzuć repo na GitHub.
2. Na Railway: **New Project → Deploy from GitHub Repo**.
3. Ustaw zmienne środowiskowe:
   - `ANTHROPIC_API_KEY=<twoj_klucz_qua>`
   - `ANTHROPIC_BASE_URL=https://api.quatarly.cloud/v0`
   - `CHAT_MODEL=claude-sonnet-4-5`
4. Railway automatycznie uruchomi `npm start`.
5. Po deployu dostaniesz publiczny URL (np. `https://twoj-projekt.up.railway.app`).

### Deploy przez Railway CLI (opcjonalnie)

```bash
npm i -g @railway/cli
railway login
railway init
railway up
railway variables set ANTHROPIC_API_KEY=twoj_klucz
railway variables set ANTHROPIC_BASE_URL=https://api.quatarly.cloud/v0
railway variables set CHAT_MODEL=claude-sonnet-4-5
```

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
