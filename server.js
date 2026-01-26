const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory storage (replace with database in production)
let vendors = [];
let products = [];
let conversations = [];

// API Routes
app.get('/api/vendors', (req, res) => {
  res.json(vendors);
});

app.post('/api/vendors', (req, res) => {
  const vendor = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date()
  };
  vendors.push(vendor);
  res.json(vendor);
});

app.get('/api/products', (req, res) => {
  res.json(products);
});

app.post('/api/products', (req, res) => {
  const product = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date()
  };
  products.push(product);
  res.json(product);
});

// Translation endpoint (mock implementation)
app.post('/api/translate', async (req, res) => {
  const { text, from, to } = req.body;
  
  // Mock translation - in production, use Google Translate API or similar
  const translations = {
    'hello': { 'hi': 'नमस्ते', 'es': 'hola', 'fr': 'bonjour' },
    'price': { 'hi': 'कीमत', 'es': 'precio', 'fr': 'prix' },
    'quality': { 'hi': 'गुणवत्ता', 'es': 'calidad', 'fr': 'qualité' }
  };
  
  const translated = translations[text.toLowerCase()]?.[to] || `[${to}] ${text}`;
  res.json({ translatedText: translated });
});

// Fair pricing calculation
app.post('/api/fair-price', (req, res) => {
  const { basePrice, region, category } = req.body;
  
  // Mock fair pricing algorithm
  const regionMultiplier = {
    'rural': 1.2,
    'urban': 1.0,
    'remote': 1.4
  };
  
  const categoryMultiplier = {
    'handicrafts': 1.3,
    'textiles': 1.1,
    'food': 1.0,
    'jewelry': 1.5
  };
  
  const fairPrice = basePrice * 
    (regionMultiplier[region] || 1.0) * 
    (categoryMultiplier[category] || 1.0);
  
  res.json({ 
    originalPrice: basePrice,
    fairPrice: Math.round(fairPrice * 100) / 100,
    markup: Math.round((fairPrice - basePrice) * 100) / 100
  });
});

// Socket.IO for real-time communication
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
  });
  
  socket.on('send-message', (data) => {
    const message = {
      id: Date.now().toString(),
      ...data,
      timestamp: new Date()
    };
    conversations.push(message);
    io.to(data.roomId).emit('receive-message', message);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Multilingual Mandi server running on port ${PORT}`);
});