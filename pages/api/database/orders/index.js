import Order from "@/models/Order";
import { connectDB } from "@/lib/database";
import Movement from "@/models/Movement";

export default async function handler(req, res) {
  await connectDB();
  switch (req.method) {
    case "GET":
      try {
        const { page = 1, limit = 30 } = req.query;
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);

        // Consulta para obtener las órdenes paginadas
        const orders = await Order.find({})
          .sort({ createdAt: -1 }) // Ordenar por fecha descendente
          .populate("movements")
          .skip((pageNumber - 1) * limitNumber)
          .limit(limitNumber);

        // Cuenta el total de órdenes
        const totalOrders = await Order.countDocuments();

        // Respuesta con los datos paginados
        res.status(200).json({
          orders,
          totalOrders,
          currentPage: pageNumber,
          totalPages: Math.ceil(totalOrders / limitNumber),
        });
      } catch (error) {
        console.error("Error getting orders:", error);
        res.status(500).json({ error: "Error al obtener las órdenes" });
      }
      break;

    case "POST":
      try {
        const { tiendanubeStoreId, orderId, status, items } = req.body;
        console.log("Received data:", {
          tiendanubeStoreId,
          orderId,
          status,
          items,
        });

        const newOrder = new Order({
          store: tiendanubeStoreId,
          orderId: orderId,
          status: status,
          items: items,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        await newOrder.save();
        console.log("Order saved:", newOrder);

        res.status(201).json(newOrder);
      } catch (error) {
        console.error("Error processing the order:", error);
        res.status(400).json({
          error: "Error al procesar la tienda y crear la orden",
          details: error.message,
        });
      }
      break;

    case "PUT":
      try {
        const { id } = req.body; // ID de la orden en el cuerpo de la solicitud
        const { status } = req.body; // Campos a actualizar

        const updatedOrder = await Order.findByIdAndUpdate(
          id,
          {
            status, // Actualiza el estado
            updatedAt: new Date(), // Actualiza la fecha de modificación
          },
          { new: true, runValidators: true } // Retorna el documento actualizado
        );

        if (!updatedOrder) {
          return res.status(404).json({ error: "Orden no encontrada" });
        }

        console.log("Order updated:", updatedOrder);
        res.status(200).json(updatedOrder);
      } catch (error) {
        console.error("Error updating the order:", error);
        res.status(400).json({
          error: "Error al actualizar la orden",
          details: error.message,
        });
      }
      break;
    default:
      res.status(405).json({ error: "Método no permitido" });
      break;
  }
}
