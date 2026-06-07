const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

const GEMINI_KEY = 'AQ.Ab8RN6LqbBD7VYVqFJ3kGhJO1Ms2tJ07907vLwEvMpgByuHRug';

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/chat', async (req, res) => {
    try {
        const { messages } = req.body;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                system_instruction: { parts: [{ text: "You are OMNISCI. You are a multi-modal AI capable of chat, image generation logic, and app building. You provide expert infographics and clear structured data." }] },
                contents: messages.map(m => ({
                    role: m.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: m.content }]
                }))
            })
        });
        const data = await response.json();
        res.json({ reply: data.candidates[0].content.parts[0].text });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/image', async (req, res) => {
    try {
        const { prompt, aspectRatio } = req.body;
        let width = 1024, height = 1024;
        if (aspectRatio === '16:9') { width = 1280; height = 720; }
        else if (aspectRatio === '9:16') { width = 720; height = 1280; }
        
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&nologo=true&seed=${Math.floor(Math.random()*99999)}`;
        const imgRes = await fetch(imageUrl);
        const buffer = await imgRes.arrayBuffer();
        res.json({ image: Buffer.from(buffer).toString('base64') });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.listen(PORT, () => console.log('✦ OMNISCI Dashboard Active on Port 3000'));