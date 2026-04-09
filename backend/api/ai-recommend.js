const express = require('express');
const router = express.Router();
const { Anthropic } = require('@anthropic-ai/sdk');

// Fallback to empty string to prevent crashes if dotenv isn't set up yet
const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;

// POST /api/ai-recommend
router.post('/', async (req, res) => {
  const { mood, energy, focus, query } = req.body;
  
  if (!anthropic) {
    console.warn('[AI API] No Anthropic API Key found. Returning mock data.');
    return res.json({
      success: true,
      mocked: true,
      query: query || `Vibes: ${mood}, ${energy}, ${focus}`,
      recommendations: [
        { name: "The Matrix", type: "movies", why: "Mind-bending classic based on your dark mood." },
        { name: "Cursor IDE", type: "ai-tools", why: "Peak productivity for coding." },
        { name: "Dune", type: "books", why: "Epic world-building with intense pacing." }
      ]
    });
  }

  try {
    const prompt = query 
      ? `User is asking for: "${query}". Recommend 3 things from various categories (movies, books, games, tools).`
      : `User entered a vibe matching: Mood(${mood}), Energy(${energy}), Focus(${focus}). Recommend 3 items that fit this exact vibe perfectly.`;
    
    const message = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 1000,
      system: "You are an AI that recommends media, tools, and games. Return your answer as a raw JSON array of objects with keys: { name, type, why } where 'type' is one of [movies, books, games, ai-tools, security]. No other text or markdown block.",
      messages: [
        { role: "user", content: prompt }
      ]
    });

    const aiText = message.content[0].text;
    let parsedResults = [];
    try {
      parsedResults = JSON.parse(aiText);
    } catch(e) {
      // Basic fallback extraction if Claude includes markdown
      const match = aiText.match(/\[.*\]/s);
      if (match) parsedResults = JSON.parse(match[0]);
    }
    
    res.json({ success: true, recommendations: parsedResults });

  } catch (err) {
    console.error('[AI API Error]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
