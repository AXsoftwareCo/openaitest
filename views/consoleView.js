// views/consoleView.js
import readline from 'readline-sync';

/**
 * Solicita una entrada al usuario
 * @param {string} message - Mensaje a mostrar al usuario
 * @returns {string} - Entrada del usuario
 */
const promptUser = (message) => {
  return readline.question(message);
};

/**
 * Muestra una respuesta al usuario
 * @param {string} response - Respuesta del asistente
 */
const displayResponse = (response) => {
  console.log(response);
};

/**
 * Muestra el mensaje de bienvenida
 */
const displayWelcome = () => {
  console.log('Bienvenido a la tienda! Soy ShopBot Plus, tu asistente de compras.');
};

/**
 * Muestra el mensaje de salida
 */
const displayExitMessage = () => {
  console.log('ShopBot Plus: ¡Gracias por visitar nuestra tienda! Hasta luego.');
};

export { promptUser, displayResponse, displayWelcome, displayExitMessage };