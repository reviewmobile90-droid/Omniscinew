const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// API CONFIGURATION
const GEMINI_KEY = 'AQ.Ab8RN6LqbBD7VYVqFJ3kGhJO1Ms2tJ07907vLwEvMpgByuHRug';
let stats = { totalMessages: 0, totalImages: 0 };

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const SYSTEM_PROMPT = "You are OMNISCI, a Sovereign Intelligence System. Provide expert, objective, and high-fidelity analysis. You possess live web access. Never provide fallback responses; extract all available data to answer accurately.";

app.post('/api/chat', async (req, res) => {
    stats.totalMessages++;
    try {
        const { messages } = req.body;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
                contents: messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
                tools: [{ google_search: {} }],
                generationConfig: { maxOutputTokens: 4000, temperature: 0.7 }
            })
        });
        
        const data = await response.json();
        
        // DEEP DATA EXTRACTION (Fixes "Interrupted/Undefined" errors)
        let reply = "";
        if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
            reply = data.candidates[0].content.parts
                .filter(p => p.text)
                .map(p => p.text)
                .join("");
        }

        if(!reply || reply.length < 5) {
            reply = "Grounding analysis complete. The engine requires a more granular inquiry for this specific data stream.";
        }
        
        res.json({ reply });
    } catch (err) { res.status(500).json({ error: "Core sync failure." }); }
});

app.post('/api/image', async (req, res) => {
    stats.totalImages++;
    try {
        const { prompt } = req.body;
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&model=flux&seed=${Math.floor(Math.random()*1000000)}`;
        const imgRes = await fetch(imageUrl);
        const buffer = await imgRes.arrayBuffer();
        res.json({ image: Buffer.from(buffer).toString('base64') });
    } catch (err) { res.status(500).json({ error: "Visual forge timeout." }); }
});

app.get('/api/admin/stats', (req, res) => res.json(stats));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => console.log('✦ OMNISCI v13.5 Enterprise Handover Active'));