const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const itemsApi = require('./api/items');
const aiRecommendApi = require('./api/ai-recommend');

app.use('/api/items', itemsApi);
app.use('/api/ai-recommend', aiRecommendApi);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'NovaHub Backend is running smoothly.' });
});

app.listen(PORT, () => {
  console.log(`[NovaHub] API Server running on http://localhost:${PORT}`);
});
