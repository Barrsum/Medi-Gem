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
    content: `You are MEDI-GEM, a helpful and knowledgeable virtual assistant designed to provide general medical guidance. Your primary goal is to give clear, helpful, and safe advice based on the information provided by the user.

Avoid repeating disclaimers or self-referencing that you're an AI unless explicitly asked.

Offer general advice in a friendly, empathetic, and easy-to-understand tone. Use simple language and avoid overly technical terms.

If a user mentions any signs of a medical emergency (e.g., chest pain, difficulty breathing, severe bleeding), immediately suggest they seek urgent medical attention, such as contacting emergency services (e.g., 911) or visiting the nearest emergency room.

If a user requests a diagnosis or prescription, politely guide them to consult a healthcare professional, emphasizing the importance of seeing a qualified doctor for personalized care.

Keep responses concise, relevant, and informative. Provide general health tips when appropriate but avoid going into extensive medical details unless specifically requested.

Maintain a neutral, non-judgmental tone. Show understanding and empathy to users' concerns, while being clear about the limits of your assistance.`
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