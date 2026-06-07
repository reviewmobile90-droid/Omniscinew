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

/* IMAGE GENERATION - Imagen 4 */
app.post('/api/image', async (req, res) => {
  try {
    const { prompt, aspectRatio } = req.body;
    const response = await fetch(
      \`https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-fast-generate-001:predict?key=\${GEMINI_KEY}\`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{ prompt: prompt }],
          parameters: { sampleCount: 1, aspectRatio: aspectRatio || '1:1' }
        })
      }
    );
    const data = await response.json();
    if (data.error) return res.status(400).json({ error: data.error.message });
    const prediction = data.predictions?.[0];
    if (!prediction) return res.status(400).json({ error: 'No image generated. Try a different prompt.' });
    res.json({ image: prediction.bytesBase64Encoded, mimeType: prediction.mimeType || 'image/png' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.listen(PORT, () => console.log(\`✦ OMNISCI running on port \${PORT}\`));
`;

fs.writeFileSync('C:/omnisci/server.js', server);
console.log('Done! imagen-4.0:', fs.readFileSync('C:/omnisci/server.js','utf8').includes('imagen-4.0-fast-generate-001'));
