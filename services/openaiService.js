import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../config/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error('OPENAI_API_KEY no está definida en las variables de entorno. Por favor, verifica tu archivo .env');
}

const openai = new OpenAI({ apiKey });

const createChatCompletion = async (messages, funciones) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: messages,
      functions: funciones,
      function_call: 'auto',
    });
    return response.choices[0].message;
  } catch (error) {
    logger.error('Error en OpenAI API:', error.message);
    throw error;
  }
};

export { createChatCompletion };