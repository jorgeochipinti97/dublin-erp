import { connectDB } from "@/lib/database";
import Order from "@/models/Order";
import { getToken } from "next-auth/jwt";

export default async function handler(req, res) {
  if (req.method === "GET") {
    await connectDB();

    try {
      // Obtener el token del usuario autenticado
      const token = await getToken({ req, secret: process.env.JWT_SECRET });

      if (!token) {
        return res.status(401).json({ message: "No autenticado" });
      }

      const { tiendanubeId } = req.query;

      // Validar que el usuario tiene acceso a la tienda especificada
      if (!token.stores.includes(tiendanubeId)) {
        return res
          .status(403)
          .json({ message: "No autorizado para esta tienda." });
      }

      // Filtrar órdenes por la tienda especificada
      const query = { store: tiendanubeId };

      // Filtrar por estado si se proporciona en la query
      if (req.query.status) {
        query.status = req.query.status;
      }

      // Filtrar por rango de fechas si se proporcionan en la query
      if (req.query.startDate && req.query.endDate) {
        query.createdAt = {
          $gte: new Date(req.query.startDate),
          $lte: new Date(req.query.endDate),
        };
      }

      const orders = await Order.find(query).exec();

      if (orders.length === 0) {
        return res.status(404).json({ message: "No se encontraron órdenes." });
      }

      res.status(200).json(orders);
    } catch (error) {
      console.error("Error al obtener órdenes:", error);
      res.status(500).json({ message: "Error al obtener órdenes." });
    }
  } else {
    res.status(405).json({ message: "Método no permitido." });
  }
}
