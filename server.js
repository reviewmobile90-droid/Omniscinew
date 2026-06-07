import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Enable cross-origin resource sharing and JSON body parsing
app.use(cors());
app.use(express.json());

// Serve static frontend assets cleanly from the public folder
app.use(express.static('public'));

// Initialize the official Google Gen AI SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Core Text Analysis API Route
 * Processes compliance inquiries and streams back structured legal architecture audits
 */
app.post('/api/analyze', async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt || prompt.trim() === "") {
            return res.status(400).json({ 
                success: false,
                error: "Inquiry stream empty. Please enter a valid compliance query." 
            });
        }

        console.log(`[Omnisci Engine] Processing compliance data stream for: "${prompt}"`);

        // Trigger Gemini 2.5 Flash with custom engineering and legal persona instructions
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            text: `You are the Omnisci Core Analytics Engine, an elite expert in software architecture, corporate compliance, global data privacy laws, and software licensing legal limits. Provide a detailed, deep structural legal/technical audit for the following request: ${prompt}`
                        }
                    ]
                }
            ]
        });

        const generatedText = response.text || "Analysis complete. System array yielded empty text nodes.";

        // Send a clean, standard JSON response back to the client application
        return res.json({ 
            success: true, 
            analysis: generatedText 
        });

    } catch (error) {
        console.error("[Omnisci Engine Error]:", error);
        return res.status(500).json({ 
            success: false, 
            error: "Internal analytics engine connection timeout.",
            details: error.message 
        });
    }
});

// Start the server listener array
app.listen(port, () => {
    console.log(`===================================================`);
    console.log(` Omnisci Backend Active & Listening on Port ${port} `);
    console.log(`===================================================`);
});