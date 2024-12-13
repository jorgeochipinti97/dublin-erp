import Depot from "@/models/Depot";
import Movement from "@/models/Movement";
import Order from "@/models/Order";
import Store from "@/models/Store";

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { orderId, user, storeId, accessToken } = req.body;

  try {
    console.log("Conectando a la base de datos...");
    await connectDB();

    const timestamp = new Date();

    console.log("Obteniendo orden directamente de Tiendanube...");

    let tiendanubeOrder;
    try {
      const tiendanubeResponse = await axios.get(
        `https://api.tiendanube.com/v1/${storeId}/orders/${orderId}`,
        {
          headers: {
            Authentication: `bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      tiendanubeOrder = tiendanubeResponse.data;
      console.log("Orden de Tiendanube obtenida:", tiendanubeOrder);
    } catch (error) {
      console.error("Error al obtener la orden de Tiendanube:", error.message);
      return res
        .status(500)
        .json({ error: "Error al obtener la orden desde Tiendanube" });
    }

    console.log("Buscando orden local...");
    const existingOrder = await Order.findOne({
      tiendanubeOrderId: parseInt(orderId),
    });

    if (!existingOrder) {
      console.log("Orden no encontrada en la base de datos local.");
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    if (existingOrder.status === "DESPACHADO") {
      console.log("La orden ya ha sido despachada.");
      return res.status(400).json({
        error: "La orden ya ha sido despachada",
      });
    }

    console.log("Buscando depósito...");
    const depot = await Depot.findById("675c2ff50dbee3651aa8af53");
    if (!depot) {
      console.log("Depósito no encontrado.");
      return res.status(404).json({ error: "Depósito no encontrado" });
    }

    console.log("Validando stock en el depósito...");
    for (const product of existingOrder.products) {
      const stockItem = depot.currentStock.find(
        (item) => item.sku === product.sku
      );

      if (!stockItem) {
        console.log(`SKU ${product.sku} no encontrado en el depósito.`);
        return res
          .status(404)
          .json({ error: `SKU ${product.sku} no encontrado en el depósito` });
      }

      if (stockItem.reserved < product.quantity) {
        console.log(`Stock insuficiente para SKU ${product.sku}.`);
        return res.status(400).json({
          error: `Stock reservado insuficiente para SKU ${product.sku}`,
        });
      }

      // Actualizar stock
      stockItem.reserved -= product.quantity;
      stockItem.dispatched += product.quantity;
    }

    await depot.save();

    console.log("Creando movimiento...");
    const movement = new Movement({
      products: existingOrder.products.map((product) => ({
        sku: product.sku,
        quantity: product.quantity,
      })),
      depot: depot._id,
      date: timestamp,
      type: "dispatch",
      fromState: "reserved",
      toState: "dispatched",
      user: user,
    });

    await movement.save();

    depot.movements.push(movement._id);
    await depot.save();

    console.log("Actualizando estado de la orden...");
    existingOrder.status = "DESPACHADO";
    existingOrder.updatedAt = timestamp;
    existingOrder.managedBy = user;
    existingOrder.movements.push(movement._id);
    await existingOrder.save();

    console.log("Buscando tienda asociada...");
    const tienda = await Store.findOne({ tiendanubeStoreId: Number(storeId) });

    if (!tienda) {
      console.log("Tienda no encontrada.");
      return res.status(404).json({ error: "Tienda no encontrada" });
    }

    // console.log("Enviando correo...");
    // const emailData = {
    //   to: tiendanubeOrder.customer.email,
    //   storeName: tienda.name,
    //   orderId: orderId,
    //   trackingLink: tiendanubeOrder.shipping_tracking_url || "No disponible",
    // };

    // try {
    //   const emailResponse = await axios.post(
    //     "https://e-full.vercel.app/api/email/dispatch",
    //     emailData
    //   );

    //   if (emailResponse.status !== 200) {
    //     console.error("Error enviando el correo:", emailResponse.data);
    //     return res.status(500).json({
    //       error: "Orden despachada, pero falló el envío del correo.",
    //     });
    //   }
    // } catch (emailError) {
    //   console.error("Error enviando correo:", emailError.message);
    //   return res.status(500).json({
    //     error: "Orden despachada, pero falló el envío del correo.",
    //   });
    // }

    console.log("Proceso completado con éxito.");
    return res
      .status(200)
      .json({ message: "Orden despachada y stock actualizado con éxito" });
  } catch (error) {
    console.error("Error al procesar el despacho:", error.message);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
