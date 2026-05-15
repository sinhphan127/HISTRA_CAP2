
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

async function listModelsV1Beta() {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  try {
    const response = await axios.get(url);
    console.log('Available models (v1beta):', response.data.models.map(m => m.name));
  } catch (error) {
    console.error('Error listing models:', error.message);
  }
}

listModelsV1Beta();
