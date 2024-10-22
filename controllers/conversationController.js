import { v4 as uuidv4 } from 'uuid';
import Conversation from '../models/Conversation.js';
import ErrorLog from '../models/ErrorLog.js';
import { 
  getProductInfo, 
  checkStock, 
  recommendProducts, 
  getMostExpensiveAndCheapestProducts,
  getAllCategories,
  getProductList
} from '../services/productService.js';
import { createChatCompletion } from '../services/openaiService.js';
import readline from 'readline-sync';
import chalk from 'chalk';
import logger from '../config/logger.js';

const funciones = [
  {
    name: 'getProductInfo',
    description: 'Obtener detalles de un producto por su nombre.',
    parameters: {
      type: 'object',
      properties: {
        productName: {
          type: 'string',
          description: 'El nombre del producto para obtener información.',
        },
      },
      required: ['productName'],
    },
  },
  {
    name: 'checkStock',
    description: 'Verificar si un producto está en stock por su nombre.',
    parameters: {
      type: 'object',
      properties: {
        productName: {
          type: 'string',
          description: 'El nombre del producto para verificar el stock.',
        },
      },
      required: ['productName'],
    },
  },
  {
    name: 'recommendProducts',
    description: 'Recomendar productos basados en una categoría o interés, o listar todos los productos si no se especifica una categoría.',
    parameters: {
      type: 'object',
      properties: {
        categoria: {
          type: 'string',
          description: 'La categoría para la cual se desean recomendaciones (opcional).',
        },
      },
    },
  },
  {
    name: 'getMostExpensiveAndCheapestProducts',
    description: 'Obtener información sobre el producto más caro y el más barato.',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'getAllCategories',
    description: 'Obtener todas las categorías de productos disponibles.',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'getProductList',
    description: 'Obtener una lista de todos los productos con sus precios.',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
];

const handleAssistantResponse = async (message, conversationId) => {
  const { name, arguments: args } = message.function_call;
  const argumentos = JSON.parse(args);
  let resultado = '';

  switch (name) {
    case 'getProductInfo':
      resultado = getProductInfo(argumentos.productName);
      break;
    case 'checkStock':
      resultado = checkStock(argumentos.productName);
      break;
    case 'recommendProducts':
      resultado = recommendProducts(argumentos.categoria);
      break;
    case 'getMostExpensiveAndCheapestProducts':
      resultado = getMostExpensiveAndCheapestProducts();
      break;
    case 'getAllCategories':
      resultado = getAllCategories();
      break;
    case 'getProductList':
      resultado = getProductList();
      break;
    default:
      resultado = 'Función desconocida.';
  }

  await Conversation.updateOne(
    { conversationId },
    {
      $push: {
        messages: { role: 'function', name: name, content: resultado },
      },
    }
  );

  const respuestaFinal = await createChatCompletion(
    [...(await Conversation.findOne({ conversationId })).messages, { role: 'function', name: name, content: resultado }],
    funciones
  );

  await Conversation.updateOne(
    { conversationId },
    {
      $push: {
        messages: { role: 'assistant', content: respuestaFinal.content },
      },
    }
  );

  logger.info({
    event: 'Función Llamada',
    name: name,
    conversationId: conversationId,
    arguments: JSON.stringify(argumentos)
  });

  return respuestaFinal.content;
};

const obtenerRespuesta = async (usuarioInput, conversationId) => {
  const conversation = await Conversation.findOne({ conversationId });
  const mensajes = conversation.messages;

  try {
    const mensaje = await createChatCompletion(
      [...mensajes, { role: 'user', content: usuarioInput }],
      funciones
    );

    if (mensaje.function_call) {
      return await handleAssistantResponse(mensaje, conversationId);
    } else {
      await Conversation.updateOne(
        { conversationId },
        {
          $push: {
            messages: { role: 'assistant', content: mensaje.content },
          },
        }
      );

      logger.info({
        event: 'Respuesta del Asistente',
        conversationId: conversationId,
        user_input: usuarioInput,
        assistant_response: mensaje.content
      });

      return mensaje.content;
    }
  } catch (error) {
    const runId = uuidv4();
    await ErrorLog.create({
      runId,
      error: error.message,
    });

    logger.error({
      event: 'Error en la Ejecución',
      runId: runId,
      error: error.message
    });

    return 'Lo siento, ha ocurrido un error al procesar tu solicitud. Por favor, intenta de nuevo más tarde.';
  }
};

const iniciarConversacion = async () => {
  console.log(chalk.yellow('Bienvenido a la tienda! Soy ShopBot Plus, tu asistente de compras.'));
  const conversationId = uuidv4();

  const nuevaConversacion = new Conversation({
    conversationId,
    messages: [{
      role: 'system',
      content: `Eres un asistente de comercio electrónico llamado ShopBot Plus. Ayudas a los usuarios a obtener información sobre productos de nuestra tienda. Responde de manera concisa y directa a las preguntas de los usuarios, utilizando la información proporcionada por las funciones cuando sea necesario.`
    }],
  });

  await nuevaConversacion.save();

  while (true) {
    const usuarioInput = readline.question(chalk.cyan('\nTú: '));
    if (usuarioInput.trim().toLowerCase() === 'salir') {
      console.log(chalk.yellow('ShopBot Plus: ¡Gracias por visitar nuestra tienda! Hasta luego.'));
      await Conversation.updateOne(
        { conversationId },
        {
          $push: {
            messages: { role: 'assistant', content: '¡Gracias por visitar nuestra tienda! Hasta luego.' },
          },
        }
      );

      logger.info({
        event: 'Fin de la Conversación',
        conversationId: conversationId
      });
      break;
    }

    const respuesta = await obtenerRespuesta(usuarioInput, conversationId);
    console.log(chalk.yellow(`ShopBot Plus: ${respuesta}`));
  }
};

export { iniciarConversacion };