// /api/reports/stock-distribution.js
import { connectDB } from "@/lib/database";
import Depot from "@/models/Depot";

export default async function handler(req, res) {
  await connectDB();

  try {
    const depots = await Depot.aggregate([
      { $unwind: "$currentStock" },
      {
        $group: {
          _id: null,
          qualityControl: { $sum: "$currentStock.qualityControl" },
          damaged: { $sum: "$currentStock.damaged" },
          shelf: { $sum: "$currentStock.shelf" },
          reserved: { $sum: "$currentStock.reserved" },
          dispatched: { $sum: "$currentStock.dispatched" },
        },
      },
    ]);

    res.status(200).json(depots[0]);
  } catch (error) {
    console.error("Error al obtener la distribución del stock:", error.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}
