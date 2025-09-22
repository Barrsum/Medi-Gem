require('dotenv').config();
const express = require('express');
const OpenAI = require('openai');
const cors = require('cors');

const app = express();
const port = 3001; // We'll run this on a different port than our React app

// Setup CORS to allow requests from our React frontend
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

// Define the API endpoint for chat
app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;

  if (!messages) {
    return res.status(400).json({ error: 'Messages are required' });
  }

  // The System Prompt: This is where we instruct the AI
  const systemPrompt = {
    role: 'system',
    content: `You are MEDI-GEM, a helpful AI medical assistant. Your primary goal is to provide safe, cautious, and informative general medical advice. You are not a real doctor and cannot diagnose, treat, or prescribe. 
    ALWAYS begin your first response with a clear disclaimer: "Please remember, I am an AI assistant and not a substitute for professional medical advice. For any real medical concerns, please consult a qualified healthcare provider." 
    For subsequent responses, you do not need to repeat the full disclaimer. 
    Your tone should be empathetic, clear, and easy to understand. Avoid overly technical jargon. If a user asks for a diagnosis or prescription, you MUST decline and strongly recommend they see a real doctor.
    If a user's query seems to indicate a medical emergency (e.g., "chest pain," "difficulty breathing," "severe bleeding"), you MUST immediately advise them to contact emergency services (e.g., 911 in the US) or go to the nearest emergency room.
    Keep your answers concise but informative.`
  };

  try {
    const completion = await openai.chat.completions.create({
      model: "nvidia/llama-3.1-nemotron-70b-instruct",
      messages: [systemPrompt, ...messages], // Prepend the system prompt to the conversation
      temperature: 0.5,
      top_p: 1,
      max_tokens: 1024,
      stream: true,
    });

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    for await (const chunk of completion) {
      const content = chunk.choices[0]?.delta?.content || '';
      res.write(`data: ${JSON.stringify({ content })}\n\n`);
    }
    res.end();

  } catch (error) {
    console.error('Error with NVIDIA API:', error);
    res.status(500).json({ error: 'Failed to get response from AI' });
  }
});

app.listen(port, () => {
  console.log(`MEDI-GEM AI server listening on http://localhost:${port}`);
});