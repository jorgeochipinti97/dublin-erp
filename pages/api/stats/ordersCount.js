// /api/stats/ordersCount.js
import Order from "@/models/Order";
import dayjs from "dayjs";
import { connectDB } from "@/lib/database";

export default async function handler(req, res) {
  await connectDB();

  try {
    // Total de órdenes y por estado
    const totalOrders = await Order.countDocuments();
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Fechas para los últimos 5 días incluyendo hoy
    const dates = Array.from({ length: 6 }, (_, i) => dayjs().subtract(i, "day").startOf("day"));

    // Cálculo de órdenes del día actual
    const todayCount = await Order.countDocuments({
      createdAt: { $gte: dates[0].toDate() },
    });

    // Cálculo de órdenes en los últimos 5 días
    const last5DaysCounts = await Promise.all(
      dates.slice(1).map(async (date, i) => {
        const startOfDay = date.toDate();
        const endOfDay = dates[i].toDate();
        const count = await Order.countDocuments({
          createdAt: { $gte: startOfDay, $lt: endOfDay },
        });
        return { date: date.format("YYYY-MM-DD"), count };
      })
    );

    res.status(200).json({
      totalOrders,
      ordersByStatus,
      todayCount,
      last5DaysCounts,
    });
  } catch (error) {
    console.error("Error fetching orders count:", error);
    res.status(500).json({ message: "Error al obtener el conteo de órdenes" });
  }
}
