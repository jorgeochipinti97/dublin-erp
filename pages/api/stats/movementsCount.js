// /api/stats/movementsCount.js

import { connectDB } from "@/lib/database";
import Movement from "@/models/Movement";
import dayjs from "dayjs";

export default async function handler(req, res) {
  await connectDB();

  try {
    // Total de movimientos y por tipo
    const totalMovements = await Movement.countDocuments();
    const movementsByType = await Movement.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]);

    // Fechas para los últimos 5 días incluyendo hoy
    const dates = Array.from({ length: 6 }, (_, i) => dayjs().subtract(i, "day").startOf("day"));

    // Cálculo de movimientos del día actual
    const todayCount = await Movement.countDocuments({
      createdAt: { $gte: dates[0].toDate() },
    });

    // Cálculo de movimientos en los últimos 5 días
    const last5DaysCounts = await Promise.all(
      dates.slice(1).map(async (date, i) => {
        const startOfDay = date.toDate();
        const endOfDay = dates[i].toDate();
        const count = await Movement.countDocuments({
          createdAt: { $gte: startOfDay, $lt: endOfDay },
        });
        return { date: date.format("YYYY-MM-DD"), count };
      })
    );

    res.status(200).json({
      totalMovements,
      movementsByType,
      todayCount,
      last5DaysCounts,
    });
  } catch (error) {
    console.error("Error fetching movements count:", error);
    res.status(500).json({ message: "Error al obtener el conteo de movimientos" });
  }
}
