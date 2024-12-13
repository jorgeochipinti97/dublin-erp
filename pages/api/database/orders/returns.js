// pages/api/returns.js
import { connectDB } from "@/lib/database";
import Order from "@/models/Order";
import Depot from "@/models/Depot";
import Movement from "@/models/Movement";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { orderId } = req.body;

  try {
    await connectDB();
    const timestamp = new Date();

    // Buscar la orden existente
    const existingOrder = await Order.findOne({ tiendanubeOrderId: orderId });

    if (!existingOrder) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    // Verificar si la orden ya está devuelta
    if (existingOrder.status === "RETURNED") {
      return res.status(400).json({
        error: "La orden ya ha sido devuelta",
      });
    }

    // Actualizar el estado de la orden a "RETURNED"
    existingOrder.status = "RETURNED";
    existingOrder.updatedAt = timestamp;
    await existingOrder.save();

    // Buscar el depósito asociado a la orden
    const depot = await Depot.findById('675c2ff50dbee3651aa8af53');
    if (!depot) {
      return res.status(404).json({ error: "Depósito no encontrado" });
    }

    // Actualizar el stock en el depósito
    for (const product of existingOrder.products) {
      const stockItem = depot.currentStock.find(
        (item) => item.sku === product.sku
      );

      if (!stockItem) {
        return res
          .status(404)
          .json({ error: `SKU ${product.sku} no encontrado en el depósito` });
      }

      // Mover de dispatched a qualityControl
      stockItem.dispatched -= product.quantity;
      stockItem.qualityControl += product.quantity;
    }

    await depot.save();

    // Registrar el movimiento de devolución
    const movement = new Movement({
      products: existingOrder.products,
      depot: depot._id,
      date: timestamp,
      type: "return", // Tipo de movimiento interno
      fromState:'dispatched',
      toState:"qualityControl",

    });
    await movement.save();

    // Añadir el movimiento al depósito
    depot.movements.push(movement._id);
    await depot.save();

    existingOrder.movements.push(movement._id); // Añadir el ID del movimiento a la orden
    await existingOrder.save();

    return res
      .status(200)
      .json({ message: "Orden devuelta y stock actualizado con éxito" });
  } catch (error) {
    console.error("Error al procesar la devolución:", error.message);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
