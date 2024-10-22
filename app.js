import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import connectDB from './config/db.js';
import { iniciarConversacion } from './controllers/conversationController.js';
import logger from './config/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

console.log(chalk.cyan('OPENAI_API_KEY:'), process.env.OPENAI_API_KEY ? chalk.green('Definida') : chalk.red('No definida'));

async function main() {
  try {
    await connectDB();
    logger.info('Conectado a MongoDB');
    console.log(chalk.green('Conectado a MongoDB'));
    await iniciarConversacion();
  } catch (error) {
    logger.error('Error al iniciar la aplicación:', error);
    console.error(chalk.red('Error al iniciar la aplicación:'), error);
  }
}

main();