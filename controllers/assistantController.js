import OpenAI from 'openai';
import { getProductInfo, checkStock } from '../services/productService.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const initializeAssistant = async () => {
  const assistant = await openai.beta.assistants.create({
    name: "ShopBot",
    instructions: "Eres un asistente de compras llamado ShopBot. Ayudas a los usuarios a obtener información sobre productos de nuestra tienda. Responde de manera concisa y directa a las preguntas de los usuarios, utilizando la información proporcionada por las funciones cuando sea necesario.",
    model: "gpt-4o",
    tools: [{
      type: "function",
      function: {
        name: "getProductInfo",
        description: "Obtener detalles de un producto por su nombre.",
        parameters: {
          type: "object",
          properties: {
            productName: {
              type: "string",
              description: "El nombre del producto para obtener información.",
            },
          },
          required: ["productName"],
        },
      }
    },
    {
      type: "function",
      function: {
        name: "checkStock",
        description: "Verificar si un producto está en stock por su nombre.",
        parameters: {
          type: "object",
          properties: {
            productName: {
              type: "string",
              description: "El nombre del producto para verificar el stock.",
            },
          },
          required: ["productName"],
        },
      }
    }]
  });

  return assistant;
};

const handleUserInput = async (assistantId, userInput) => {
  const thread = await openai.beta.threads.create();
  
  await openai.beta.threads.messages.create(thread.id, {
    role: "user",
    content: userInput
  });

  const run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: assistantId
  });

  let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);

  while (runStatus.status !== 'completed') {
    await new Promise(resolve => setTimeout(resolve, 1000));
    runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);

    if (runStatus.status === 'requires_action') {
      const toolCalls = runStatus.required_action.submit_tool_outputs.tool_calls;
      const toolOutputs = [];

      for (const toolCall of toolCalls) {
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);

        let functionResult;
        if (functionName === 'getProductInfo') {
          functionResult = getProductInfo(functionArgs.productName);
        } else if (functionName === 'checkStock') {
          functionResult = checkStock(functionArgs.productName);
        }

        toolOutputs.push({
          tool_call_id: toolCall.id,
          output: JSON.stringify(functionResult)
        });
      }

      await openai.beta.threads.runs.submitToolOutputs(thread.id, run.id, {
        tool_outputs: toolOutputs
      });
    }
  }

  const messages = await openai.beta.threads.messages.list(thread.id);
  const lastMessageForHuman = messages.data
    .filter(message => message.role === 'assistant')
    .pop();

  return lastMessageForHuman.content[0].text.value;
};

export { initializeAssistant, handleUserInput };