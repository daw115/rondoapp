const messagesEl = document.getElementById('messages');
const formEl = document.getElementById('chatForm');
const promptEl = document.getElementById('prompt');
const sendBtn = document.getElementById('sendBtn');
const clearBtn = document.getElementById('clearBtn');
const creditsBtn = document.getElementById('creditsBtn');
const creditsInfo = document.getElementById('creditsInfo');
const modelSelect = document.getElementById('modelSelect');

const history = [];

function addMessage(role, content) {
  history.push({ role, content });

  const node = document.createElement('article');
  node.className = `message ${role}`;
  node.textContent = content;
  messagesEl.appendChild(node);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function setPending(isPending) {
  sendBtn.disabled = isPending;
  promptEl.disabled = isPending;
  modelSelect.disabled = isPending;
  sendBtn.textContent = isPending ? 'Wysyłanie...' : 'Wyślij';
}

async function loadModels() {
  try {
    const response = await fetch('/api/models');
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || 'Nie udało się pobrać listy modeli.');
    }

    const models = Array.isArray(payload.data) ? payload.data : [];
    const fallback = ['claude-sonnet-4-5', 'claude-haiku-4-5', 'gpt-4.1'];
    const names = models.length > 0 ? models.map((m) => m.id).filter(Boolean) : fallback;

    modelSelect.innerHTML = names.map((name) => `<option value="${name}">${name}</option>`).join('');
  } catch (error) {
    modelSelect.innerHTML = '<option value="claude-sonnet-4-5">claude-sonnet-4-5</option>';
    creditsInfo.textContent = `Błąd modeli: ${error.message}`;
  }
}

formEl.addEventListener('submit', async (event) => {
  event.preventDefault();
  const input = promptEl.value.trim();
  if (!input) return;

  addMessage('user', input);
  promptEl.value = '';

  try {
    setPending(true);

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelSelect.value,
        messages: history,
      }),
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || 'Nie udało się pobrać odpowiedzi.');
    }

    addMessage('assistant', payload.reply);
    if (payload.usage) {
      creditsInfo.textContent = `Użycie tokenów: ${JSON.stringify(payload.usage)}`;
    }
  } catch (error) {
    addMessage('assistant', `Błąd: ${error.message}`);
  } finally {
    setPending(false);
    promptEl.focus();
  }
});

creditsBtn.addEventListener('click', async () => {
  creditsInfo.textContent = 'Pobieram...';
  try {
    const response = await fetch('/api/credits');
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || 'Nie udało się pobrać kredytów.');
    }

    creditsInfo.textContent = `Saldo: ${JSON.stringify(payload)}`;
  } catch (error) {
    creditsInfo.textContent = `Błąd: ${error.message}`;
  }
});

clearBtn.addEventListener('click', () => {
  history.length = 0;
  messagesEl.innerHTML = '';
  promptEl.focus();
});

loadModels();
