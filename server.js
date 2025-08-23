const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
//-----------------------------------------------------
//  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
//res.header('Access-Control-Allow-Methods', 'GET', 'POST', 'PUT', 'DELETE');
//res.header('Access-Control-Allow-Headers', 'Content-Type', 'Authorization');
 //------------------------------------------------------ 
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
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

    console.log('🚀 Server: Processing chat request with mock LLM');
    console.log('💭 Message:', message);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Generate mock response based on user input
    const mockResponse = generateMockResponse(message);
    
    const data = {
      choices: [{
        message: {
          role: 'assistant',
          content: mockResponse
        }
      }]
    };
    
    console.log('✅ Server: Mock response generated');
    
    res.json(data);
  } catch (error) {
    console.error('❌ Server Error:', error);
    res.status(500).json({ 
      error: 'Internal server error: ' + error.message 
    });
  }
});

// Mock LLM response generator
function generateMockResponse(userMessage) {
  const message = userMessage.toLowerCase();
  
  // Greeting responses
  if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
    return "Hello! I'm a mock AI assistant running in this demo. How can I help you today?";
  }
  
  // Questions about the demo
  if (message.includes('demo') || message.includes('test') || message.includes('working')) {
    return "This is a working Angular LLM chat demo! I'm a mock AI assistant that simulates responses since we're running in a WebContainer environment with network restrictions. The chat interface, error handling, and debugging features are all fully functional.";
  }
  
  // Technical questions
  if (message.includes('angular') || message.includes('typescript') || message.includes('code')) {
    return "I can help with Angular and TypeScript questions! This demo showcases a complete chat interface with:\n\n• Real-time messaging\n• Error handling\n• Debug mode\n• Responsive design\n• Mock AI responses\n\nWhat specific technical topic would you like to discuss?";
  }
  
  // Programming questions
  if (message.includes('javascript') || message.includes('programming') || message.includes('development')) {
    return "Great question about programming! While I'm a mock assistant in this demo, I can still provide helpful responses about web development, JavaScript, Angular, and related technologies. The chat interface you're using demonstrates modern web development practices with TypeScript, RxJS, and responsive design.";
  }
  
  // Math or calculations
  if (message.includes('calculate') || message.includes('math') || /\d+[\+\-\*\/]\d+/.test(message)) {
    return "I can help with calculations! While this is a mock response, in a real implementation, I could perform mathematical operations and provide detailed explanations. This demo focuses on showcasing the chat interface and user experience.";
  }
  
  // Help requests
  if (message.includes('help') || message.includes('how') || message.includes('what')) {
    return "I'm here to help! This is a mock AI assistant in an Angular chat demo. I can respond to various topics like:\n\n• Technical questions about web development\n• General conversation\n• Demo-related inquiries\n• Programming concepts\n\nTry asking me about Angular, TypeScript, or web development!";
  }
  
  // Default responses with variety
  const defaultResponses = [
    "That's an interesting point! As a mock AI assistant in this demo, I can engage in conversation about various topics. The chat interface you're using demonstrates real-time messaging, error handling, and modern web development practices.",
    
    "Thanks for your message! I'm a simulated AI assistant running in this Angular demo. This showcases how you could integrate a real LLM service with proper error handling, debugging features, and a responsive chat interface.",
    
    "I appreciate your input! While I'm providing mock responses in this demo environment, the chat system demonstrates production-ready features like message history, loading states, error handling, and debug capabilities.",
    
    "Great question! This Angular LLM demo shows how to build a robust chat interface. Even though I'm a mock assistant due to network restrictions, all the UI components, state management, and user experience features are fully functional.",
    
    "Interesting! This demo illustrates how to create an engaging chat experience with Angular. The interface includes features like typing indicators, message history, error recovery, and debug tools - all working with this mock AI backend."
  ];
  
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

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