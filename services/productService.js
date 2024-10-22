import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cargarCatalogo = () => {
  const datos = fs.readFileSync(path.join(__dirname, '..', 'catalogo.json'), 'utf-8');
  return JSON.parse(datos);
};

const catalogo = cargarCatalogo();

const getProductInfo = (productName) => {
  const producto = catalogo.find(
    (item) => item.nombre.toLowerCase() === productName.toLowerCase()
  );
  if (producto) {
    return `
Información del producto:
- Nombre: ${producto.nombre}
- Descripción: ${producto.descripcion}
- Precio: $${producto.precio}
- Stock disponible: ${producto.stock}
- Categoría: ${producto.categoria}
    `.trim();
  } else {
    return `Lo siento, no pude encontrar un producto llamado "${productName}".`;
  }
};

const checkStock = (productName) => {
  const producto = catalogo.find(
    (item) => item.nombre.toLowerCase() === productName.toLowerCase()
  );
  if (producto) {
    return producto.stock > 0
      ? `Sí, "${producto.nombre}" está disponible en stock (${producto.stock} unidades).`
      : `Lo siento, "${producto.nombre}" no está disponible en este momento.`;
  } else {
    return `No encontré información sobre el producto "${productName}".`;
  }
};

const recommendProducts = (categoria) => {
  let productosRecomendados;
  if (categoria) {
    productosRecomendados = catalogo.filter(
      (item) => item.categoria.toLowerCase() === categoria.toLowerCase()
    );
  } else {
    productosRecomendados = catalogo;
  }
  
  if (productosRecomendados.length > 0) {
    let recomendaciones = categoria 
      ? `Productos en la categoría "${categoria}":\n`
      : "Lista completa de productos:\n";
    productosRecomendados.forEach((producto) => {
      recomendaciones += `- ${producto.nombre} ($${producto.precio})\n`;
    });
    return recomendaciones;
  } else {
    return `Lo siento, no tengo recomendaciones para la categoría "${categoria}".`;
  }
};

const getMostExpensiveAndCheapestProducts = () => {
  const sortedProducts = [...catalogo].sort((a, b) => a.precio - b.precio);
  const cheapest = sortedProducts[0];
  const mostExpensive = sortedProducts[sortedProducts.length - 1];

  return `
Producto más económico:
- Nombre: ${cheapest.nombre}
- Precio: $${cheapest.precio}
- Descripción: ${cheapest.descripcion}

Producto más caro:
- Nombre: ${mostExpensive.nombre}
- Precio: $${mostExpensive.precio}
- Descripción: ${mostExpensive.descripcion}
  `.trim();
};

const getAllCategories = () => {
  const categories = [...new Set(catalogo.map(item => item.categoria))];
  return `Categorías disponibles:\n${categories.join('\n')}`;
};

const getProductList = () => {
  return catalogo.map(product => `${product.nombre}: $${product.precio}`).join('\n');
};

export { 
  getProductInfo, 
  checkStock, 
  recommendProducts, 
  getMostExpensiveAndCheapestProducts, 
  getAllCategories,
  getProductList
};