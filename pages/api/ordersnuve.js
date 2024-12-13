import axios from "axios";
import dayjs from "dayjs";

export default async function handler(req, res) {
  const { method, query } = req;

  if (method !== "GET") {
    console.log("Método no permitido:", method);
    return res.status(405).json({ message: "Método no permitido" });
  }

  const {
    storeId,
    accessToken,
    created_at_min,
    created_at_max,
    payment_status,
    shipping_status,
    page = 1,
    per_page = 10,
  } = query;

  // Validar `storeId` y `accessToken`
  if (!storeId || !accessToken) {
    console.log("Faltan storeId o accessToken:", { storeId, accessToken });
    return res.status(400).json({ message: "Faltan storeId o accessToken" });
  }

  // URL de Tiendanube para la tienda seleccionada
  const url = `https://api.tiendanube.com/v1/${storeId}/orders`;
  const headers = {
    Authentication: `bearer ${accessToken}`,
    "User-Agent": "E-full (softwaredublin83@gmail.com)",
  };

  // Configurar rangos de fecha predeterminados
  const createdAtMin = created_at_min || dayjs().subtract(2, "days").toISOString();
  const createdAtMax = created_at_max || dayjs().toISOString();

  console.log("Parametros de fecha:", { createdAtMin, createdAtMax });

  // Asegurarse de que per_page no exceda el límite de la API (50)
  const perPageNumber = Math.min(parseInt(per_page, 10), 50);
  const pageNumber = parseInt(page, 10) || 1;

  // Configurar parámetros de búsqueda
  const params = {
    created_at_min: createdAtMin,
    created_at_max: createdAtMax,
    per_page: perPageNumber,
    page: pageNumber,
  };

  if (payment_status && payment_status !== "all") {
    params.payment_status = payment_status;
  }
  if (shipping_status && shipping_status !== "all") {
    params.shipping_status = shipping_status;
  }

  console.log("URL de la API de Tiendanube:", url);
  console.log("Encabezados:", headers);
  console.log("Parámetros de búsqueda:", params);

  try {
    const response = await axios.get(url, { headers, params });
    console.log("Respuesta de Tiendanube recibida:", response.data);

    const fetchedOrders = response.data;

    const orders = fetchedOrders.map((order) => ({
      id: order.id,
      customer: order.customer,
      payment_status: order.payment_status,
      shipping_status: order.shipping_status,
      created_at: order.created_at,
      products: order.products, // incluir productos si es necesario
    }));

    const totalOrders = parseInt(response.headers["x-total-count"], 10) || orders.length;

    res.status(200).json({
      orders,
      page: pageNumber,
      per_page: perPageNumber,
      total_orders: totalOrders,
    });
  } catch (error) {
    if (error.response) {
      console.error("Error de respuesta:", error.response.status);
      console.error("Datos de error:", error.response.data);
    } else {
      console.error("Error de solicitud:", error.message);
    }
    res.status(error.response?.status || 500).json({ message: error.message });
  }
}
