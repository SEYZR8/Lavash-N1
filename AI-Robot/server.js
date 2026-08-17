require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const fallback = (message) => `AURA demo mode: ${message}\n\nAI server hali sozlanmagan. .env faylida AI_API_KEY va AI_API_URL ni sozlasangiz, men to‘liq AI modeliga ulanaman.`;

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, name: 'AURA', aiConfigured: Boolean(process.env.AI_API_KEY), model: process.env.AI_MODEL || null });
});

app.post('/api/chat', async (req, res) => {
  try {
    const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
    if (!messages.length) return res.status(400).json({ error: 'messages kerak' });
    const safeMessages = messages.slice(-20).map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content || '').slice(0, 12000)
    }));

    if (!process.env.AI_API_KEY) {
      return res.json({ reply: fallback(safeMessages.at(-1)?.content || 'Salom!') , demo: true });
    }

    const url = process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions';
    const system = process.env.SYSTEM_PROMPT || 'You are AURA, a precise technology assistant.';
    const payload = {
      model: process.env.AI_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'system', content: system }, ...safeMessages],
      temperature: 0.35
    };

    const upstream = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.AI_API_KEY}` },
      body: JSON.stringify(payload)
    });
    const data = await upstream.json();
    if (!upstream.ok) return res.status(502).json({ error: data?.error?.message || 'AI provider xatosi' });
    const reply = data?.choices?.[0]?.message?.content;
    if (!reply) return res.status(502).json({ error: 'AI javobi topilmadi' });
    res.json({ reply, demo: false });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => console.log(`AURA running on port ${PORT}`));
