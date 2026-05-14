import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

async function listModels() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  try {
    const response = await axios.get(url);
    console.log("Available Models:");
    response.data.models.forEach(m => {
      console.log(`- ${m.name} (${m.displayName})`);
    });
  } catch (error) {
    console.error("FAILED to list models:", error.response ? error.response.status : error.message);
    if (error.response) console.error("Error Body:", JSON.stringify(error.response.data, null, 2));
  }
}

listModels();
