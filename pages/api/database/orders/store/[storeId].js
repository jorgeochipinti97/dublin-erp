import { connectDB } from "@/lib/database";
import Order from "@/models/Order";
import { getToken } from "next-auth/jwt";

export default async function handler(req, res) {
  // Conectar a la base de datos
  await connectDB();

  // Validar el token del usuario
  const token = await getToken({ req, secret: process.env.JWT_SECRET });
  console.log(token)
  if (!token) {
    return res.status(401).json({ message: "No autenticado" });
  }

  // Obtener el ID de la tienda desde los parámetros
  const { storeId } = req.query;

  // Verificar si el usuario tiene acceso a la tienda
  if (!token.stores.includes(storeId)) {
    return res.status(403).json({ message: "No autorizado para esta tienda" });
  }

  try {
    // Construir la consulta para las órdenes
    const query = { store: storeId };

    // Filtrar por estado si está presente en la query
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filtrar por rango de fechas si está presente en la query
    if (req.query.startDate && req.query.endDate) {
      query.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate),
      };
    }

    // Configurar la paginación
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Buscar las órdenes con paginación
    const orders = await Order.find(query).skip(skip).limit(limit).exec();

    // Contar el total de órdenes
    const totalOrders = await Order.countDocuments(query);

    // Responder con las órdenes y datos de paginación
    res.status(200).json({
      orders,
      pagination: {
        totalOrders,
        totalPages: Math.ceil(totalOrders / limit),
        currentPage: page,
        pageSize: orders.length,
      },
    });
  } catch (error) {
    console.error("Error al obtener las órdenes:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
}
