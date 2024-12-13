import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import jwt from "jsonwebtoken";


export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return date.toLocaleDateString(undefined, options);
};

export const getOrderStatus = (ordersSupabase, orderId) => {
  const order = ordersSupabase.find((e) => e.order_id == orderId);
  return order?.status || "PENDIENTE";
};

export const getOrderProcess = (ordersSupabase, orders) => {
  const supabaseOrderIds = ordersSupabase.map((order) => order.order_id);
  return orders.filter((order) => supabaseOrderIds.includes(order.order_id));
};

export const getProductNameBySku = async (sku) => {
  if (!sku) return sku; // Retornar el SKU si no hay SKU válido

  try {
    // Llamar al endpoint que busca el producto por SKU
    const response = await axios.get(`/api/nuve/sku/${sku}`);

    if (response.data) {
      const product = response.data; // Datos del producto obtenidos
      const variant = product.variants.find((v) => v.sku === sku); // Buscar la variante que coincide con el SKU

      if (variant) {
        const productName = product.name?.es || sku; // Nombre del producto en español
        const variantValues = variant.values
          .map((value) => value.es)
          .join(" / "); // Combinar los valores en español

        return `${productName} - ${variantValues}`;
      }
    }

    return sku; // Si no se encuentra el producto o variante, retorna el SKU
  } catch (error) {
    console.error(`Error fetching product name for SKU ${sku}:`, error);
    return sku; // En caso de error, retornar el SKU como fallback
  }
};


export async function fetchAllOrders(params) {
  let allOrders = [];
  let page = 1;
  let moreOrders = true;
  const url = "https://api.tiendanube.com/v1/1935431/orders";

  const today = new Date();
  const lastWeek = new Date(today);
  lastWeek.setDate(today.getDate() - 7);

  // Formatear las fechas a ISO 8601 (YYYY-MM-DD)
  const created_at_min = lastWeek.toISOString().split("T")[0];
  const created_at_max = today.toISOString().split("T")[0];

  while (moreOrders) {
    const { data: orders } = await axios.get(url, {
      headers: {
        Authentication: "bearer 815c1929afc4c2438cf9bdc86224d05893b10d95",
        "User-Agent": "E-full (softwaredublin83@gmail.com)",
      },
      params: { ...params, page, created_at_min, created_at_max },
    });

    if (orders.length > 0) {
      allOrders = [...allOrders, ...orders];
      page += 1;

      // Si el número de órdenes devueltas es menor que `per_page`, significa que esta es la última página
      if (orders.length < params.per_page) {
        moreOrders = false;
      }
    } else {
      moreOrders = false;
    }
  }

  return allOrders;
}

export function processOrders(orders) {
  const productSales = analyzeProductSales(orders);
  const topPromotions = analyzePromotions(orders); // Puede quedar vacío si no hay promociones
  const loyalCustomers = analyzeLoyalCustomers(orders); // Ya está implementado y funcionando bien

  return { productSales, topPromotions, loyalCustomers };
}

function analyzeProductSales(orders) {
  const productSales = {};

  orders.forEach((order) => {
    order.products.forEach((product) => {
      const productId = product.product_id; // Asegúrate de usar product_id para unificar las variantes
      if (!productSales[productId]) {
        productSales[productId] = {
          name: product.name,
          totalQuantity: 0,
          totalRevenue: 0,
          image: product.image.src, // Guardamos la imagen del producto
        };
      }
      productSales[productId].totalQuantity += parseInt(product.quantity, 10);
      productSales[productId].totalRevenue +=
        parseFloat(product.price) * parseInt(product.quantity, 10);
    });
  });

  // Ordenar productos por cantidad vendida, descendente
  const sortedProductSales = Object.values(productSales).sort(
    (a, b) => b.totalQuantity - a.totalQuantity
  );

  return sortedProductSales;
}

function analyzePromotions(orders) {
  const promotions = {};

  orders.forEach((order) => {
    if (
      order.promotional_discount &&
      order.promotional_discount.promotions_applied.length > 0
    ) {
      order.promotional_discount.promotions_applied.forEach((promo) => {
        if (!promotions[promo]) {
          promotions[promo] = {
            code: promo,
            usageCount: 0,
          };
        }
        promotions[promo].usageCount += 1;
      });
    }
  });

  // Si no hay promociones, devolvemos un array vacío
  if (Object.keys(promotions).length === 0) {
    return [];
  }

  // Ordenar promociones por cantidad de uso, descendente
  const sortedPromotions = Object.values(promotions).sort(
    (a, b) => b.usageCount - a.usageCount
  );

  return sortedPromotions;
}

function analyzeLoyalCustomers(orders) {
  const customerData = {};

  orders.forEach((order) => {
    const customerId = order.customer.id;

    if (!customerData[customerId]) {
      customerData[customerId] = {
        name: order.customer.name,
        email: order.customer.email,
        totalSpent: 0,
        orders: 0,
      };
    }
    customerData[customerId].totalSpent += order.total;
    customerData[customerId].orders += 1;
  });

  // Ordenar clientes por número de órdenes, descendente
  const sortedCustomers = Object.values(customerData).sort(
    (a, b) => b.orders - a.orders
  );

  return sortedCustomers.slice(0, 10); // Retorna los 10 clientes más fieles
}



export const uploadFileToS3 = async (file, ) => {
  try {
    const fileExtension = file.name.split(".").pop();
    const key = `${file.name}.${fileExtension}`;

    const response = await fetch("/api/s3", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileType: file.type,
        key,
      }),
    });

    if (!response.ok) {
      throw new Error("Error al obtener la URL con firma previa.");
    }

    const { url } = await response.json();
    console.log("Signed URL response:", response); // Consola después de obtener la URL firmada

    const uploadResponse = await fetch(url, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    if (!uploadResponse.ok) {
      throw new Error("Error al subir el archivo a S3.");
    }

    console.log("S3 upload response:", uploadResponse); // Consola después de la subida a S3
    return key;
  } catch (error) {
    console.error("Error en la subida del archivo:", error);
    throw error;
  }
};




export function decodeToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET); // Decodificar el token con tu clave secreta
  } catch (error) {
    console.error("Error al decodificar el token:", error.message);
    return null;
  }
}



export async function fetchUserByEmail(email) {
  try {
    const response = await axios.get(`/api/database/users/email/${email}`);
    return response.data; // Devuelve el usuario encontrado
  } catch (error) {
    console.error("Error al obtener usuario:", error.response?.data || error);
    throw new Error(error.response?.data?.message || "Error al obtener usuario");
  }
}