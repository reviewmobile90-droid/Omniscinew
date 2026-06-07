const fs = require('fs');

const server = `const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const GEMINI_KEY = process.env.GEMINI_API_KEY || 'AIzaSyAhE2P1CD7vSzf04xef3HacQYNS1g-mk1k';

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

/* CHAT */
app.post('/api/chat', async (req, res) => {
  try {
    const { system, messages } = req.body;
    const geminiMessages = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));
    const payload = {
      system_instruction: { parts: [{ text: system || '' }] },
      contents: geminiMessages,
      generationConfig: { maxOutputTokens: 2000, temperature: 0.7 }
    };
    const response = await fetch(
      \`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=\${GEMINI_KEY}\`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
    );
    const data = await response.json();
    if (data.error) return res.status(400).json({ error: data.error.message });
    const reply = data.candidates[0].content.parts.map(p => p.text).join('');
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* IMAGE GENERATION - Pollinations.AI (free, no key needed) */
app.post('/api/image', async (req, res) => {
  try {
    const { prompt, aspectRatio } = req.body;

    // Map aspectRatio to width/height
    let width = 1024, height = 1024;
    if (aspectRatio === '16:9') { width = 1344; height = 768; }
    else if (aspectRatio === '9:16') { width = 768; height = 1344; }
    else if (aspectRatio === '4:3') { width = 1024; height = 768; }
    else if (aspectRatio === '3:4') { width = 768; height = 1024; }

    const encodedPrompt = encodeURIComponent(prompt);
    const url = \`https://image.pollinations.ai/prompt/\${encodedPrompt}?width=\${width}&height=\${height}&nologo=true&enhance=true\`;

    const response = await fetch(url);
    if (!response.ok) return res.status(400).json({ error: 'Image generation failed' });

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    res.json({ image: base64, mimeType: 'image/jpeg' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.listen(PORT, () => console.log(\`✦ OMNISCI running on port \${PORT}\`));
`;

fs.writeFileSync('C:/omnisci/server.js', server);
console.log('Done! Pollinations:', fs.readFileSync('C:/omnisci/server.js','utf8').includes('pollinations'));
