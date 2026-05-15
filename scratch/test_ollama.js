
import axios from 'axios';

async function checkOllama() {
  try {
    const response = await axios.get('http://localhost:11434/api/tags');
    console.log('Ollama API is running!');
    console.log('Models available:', response.data.models.map(m => m.name));
  } catch (error) {
    console.error('Error connecting to Ollama:', error.message);
  }
}

checkOllama();
