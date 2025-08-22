const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from Angular build
app.use(express.static(path.join(__dirname, 'dist/angular-llm-demo')));

// OpenAI API proxy endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'OpenAI API key not configured on server' });
    }

    console.log('🚀 Server: Proxying request to OpenAI');
    console.log('💭 Message:', message);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: message }],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ OpenAI API Error:', errorData);
      return res.status(response.status).json({ error: errorData });
    }

    const data = await response.json();
    console.log('✅ Server: Response received from OpenAI');
    
    res.json(data);
  } catch (error) {
    console.error('❌ Server Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Catch all handler for Angular routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/angular-llm-demo/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔑 OpenAI API Key configured: ${process.env.OPENAI_API_KEY ? 'Yes' : 'No'}`);
});