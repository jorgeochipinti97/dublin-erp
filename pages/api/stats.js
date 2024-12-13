import axios from "axios";
import * as XLSX from "xlsx";

export default async function handler(req, res) {
  const { method, query } = req;

  console.log("Received request:", { method });

  if (method !== "GET") {
    console.log("Invalid method:", method);
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const storeId = "1935431"; // Reemplaza con tu ID de tienda
  const accessToken = "815c1929afc4c2438cf9bdc86224d05893b10d95"; // Reemplaza con tu token de acceso

  const { startDate, endDate } = query;

  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ message: "startDate and endDate are required" });
  }

  console.log(`Fetching orders from ${startDate} to ${endDate}`);

  const ordersUrl = `https://api.tiendanube.com/v1/${storeId}/orders`;

  const retryRequest = async (fn, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i < retries - 1) await new Promise((resolve) => setTimeout(resolve, delay));
        else throw error;
      }
    }
  };

  try {
    let allOrders = [];
    const perPage = 50;

    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const specificDate = d.toISOString().split("T")[0];
      const startDateISO = `${specificDate}T00:00:00Z`;
      const endDateISO = `${specificDate}T23:59:59Z`;

      console.log(`Fetching orders for date: ${specificDate}`);

      let page = 1;

      while (true) {
        console.log(`Fetching page: ${page} for date: ${specificDate}`);

        const fetchOrders = async () => {
          const response = await axios.get(ordersUrl, {
            headers: {
              Authentication: `bearer ${accessToken}`,
              "User-Agent": "E-full (softwaredublin83@gmail.com)",
            },
            params: {
              created_at_min: startDateISO,
              created_at_max: endDateISO,
              per_page: perPage,
              page,
            },
          });
          return response.data;
        };

        let orders;
        try {
          orders = await retryRequest(fetchOrders);
        } catch (error) {
          if (error.response && error.response.status === 404) {
            console.log(`No more pages to fetch for date: ${specificDate}`);
            break;
          }
          throw error;
        }

        if (orders.length === 0) break;

        const filteredOrders = orders.filter(
          (order) =>
            order.gateway_name ===
              "EFECTIVO CONTRA-ENTREGA (Sólo CABA y GBA)" &&
            order.payment_status === "pending"
        );

        console.log(
          `Filtered ${filteredOrders.length} orders on page ${page} for date: ${specificDate}`
        );

        allOrders = [...allOrders, ...filteredOrders];
        page++;
      }
    }

    console.log(`Total filtered orders for range: ${allOrders.length}`);

    const ordersData =
      allOrders.length > 0
        ? allOrders
            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
            .map((order) => {
              const customer = order.customer || {};
              const shippingAddress = customer.default_address || {};

              return {
                ID: order.id,
                "Numero de orden": order.number,
                FECHA: new Date(order.created_at).toLocaleDateString("es-ES"),
                "NOMBRE CLIENTE": customer.name || "Sin nombre", // Nombre del cliente
                TELEFONO: customer.phone || "Sin teléfono",
                EMAIL: customer.email || "Sin email",
                DOMICILIO: `
                ${shippingAddress.address || "Sin dirección"} ${
                  shippingAddress.number || ""
                } ${shippingAddress.floor || ""}, ${
                  shippingAddress.locality || ""
                }, ${shippingAddress.city || ""}, ${
                  shippingAddress.province || ""
                }, ${shippingAddress.zipcode || ""}`.trim(),
                CIUDAD: shippingAddress.city || "Sin ciudad",
                "CÓDIGO POSTAL": shippingAddress.zipcode || "Sin código postal",
                PRODUCTO: order.products
                  .map((p) => `${p.name} (${p.quantity})`)
                  .join(", "),
                "CANTIDAD TOTAL": order.products.reduce(
                  (sum, p) => sum + p.quantity,
                  0
                ),
                "TOTAL DE LA COMPRA": `$ ${order.total}`,
                ASESOR: "Sin asignar",
                "ESTADO CONTRA ENTREGA": order.gateway_name,
                "FECHA DE CONTACTO CON EL CLIENTE": "No especificada",
                "ESTADO LOGISTICA": "Pendiente",
                "FECHA DE RECOLECCIÓN": "No especificada",
                "HORARIO DE ENVIO CORDINADO": "No especificado",
                OBSERVACIONES: order.note || "Sin observaciones",
              };
            })
        : [{ Mensaje: "No se encontraron órdenes para este rango de fechas." }];

    console.log("Preparing Excel file...");

    const worksheet = XLSX.utils.json_to_sheet(ordersData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Órdenes");

    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

    console.log("Excel file prepared, sending response.");

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=ordenes_${startDate}_to_${endDate}.xlsx`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    return res.status(200).send(buffer);
  } catch (error) {
    console.error("Error fetching orders:", error.message);

    res.status(500).json({
      message: "An unexpected error occurred while processing orders.",
      error: error.message,
    });
  }
}
