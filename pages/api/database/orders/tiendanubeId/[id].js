import { connectDB } from "@/lib/database";
import Movement from "@/models/Movement";
import Order from "@/models/Order";
import Store from "@/models/Store";
import User from "@/models/User";

export default async function handler(req, res) {
  const { id } = req.query;
  await connectDB();

  switch (req.method) {
    case "GET":
      try {
        const order = await Order.findOne({ tiendanubeOrderId: Number(id) }).populate('movements');
        console.log(order);
        if (!order) {
          return res.status(200).json({ message: "Orden aún no procesada" });
        }
        res.status(200).json(order);
      } catch (error) {
        res.status(500).json({ error: "Error al obtener la orden" });
      }
      break;

    case "PUT":
      try {
        const order = await Order.findOneAndUpdate(
          { tiendanubeOrderId: Number(id) },
          req.body,
          {
            new: true,
            runValidators: true,
          }
        )
          .populate("store")
          .populate("managedBy");
        if (!order) {
          return res.status(404).json({ error: "Orden no encontrada" });
        }
        res.status(200).json(order);
      } catch (error) {
        res.status(400).json({ error: "Error al actualizar la orden" });
      }
      break;

    case "DELETE":
      try {
        const order = await Order.findOneAndDelete({
          tiendanubeOrderId: Number(id),
        });
        if (!order) {
          return res.status(404).json({ error: "Orden no encontrada" });
        }
        res.status(200).json({ message: "Orden eliminada correctamente" });
      } catch (error) {
        res.status(500).json({ error: "Error al eliminar la orden" });
      }
      break;

    default:
      res.status(405).json({ error: "Método no permitido" });
      break;
  }
}
