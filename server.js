const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
app.use(cors({
  origin: ['http://localhost:4200', 'http://localhost:3000', 'https://localhost:4200', 'https://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Additional CORS headers for all responses
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());

// OpenAI API proxy endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === 'your-actual-openai-api-key-here') {
      console.error('❌ OpenAI API key not configured properly');
      return res.status(500).json({ 
        error: 'OpenAI API key not configured on server. Please add your API key to the .env file.' 
      });
    }

    console.log('🚀 Server: Proxying request to OpenAI');
    console.log('💭 Message:', message);

    let response;
    try {
      response = await fetch('https://api.openai.com/v1/chat/completions', {
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
    } catch (fetchError) {
      console.error('❌ Network error connecting to OpenAI:', fetchError.message);
      return res.status(500).json({ 
        error: 'Failed to connect to OpenAI API. Please check your internet connection and API key.' 
      });
    }

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ OpenAI API Error:', errorData);
      
      if (response.status === 401) {
        return res.status(401).json({ 
          error: 'Invalid OpenAI API key. Please check your API key in the .env file.' 
        });
      }
      
      return res.status(response.status).json({ 
        error: errorData.error?.message || 'OpenAI API error' 
      });
    }

    const data = await response.json();
    console.log('✅ Server: Response received from OpenAI');
    
    res.json(data);
  } catch (error) {
    console.error('❌ Server Error:', error);
    res.status(500).json({ 
      error: 'Internal server error: ' + error.message 
    });
  }
});

// Serve static files from Angular build
app.use(express.static(path.join(__dirname, 'dist/angular-llm-demo')));

// Catch all handler for Angular routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/angular-llm-demo/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  const apiKeyConfigured = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-actual-openai-api-key-here';
  console.log(`🔑 OpenAI API Key configured: ${apiKeyConfigured ? 'Yes' : 'No'}`);
  
  if (!apiKeyConfigured) {
    console.log('⚠️  Please add your OpenAI API key to the .env file to enable chat functionality');
    console.log('   Get your API key from: https://platform.openai.com/api-keys');
  }
});