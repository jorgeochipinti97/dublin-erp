import { connectDB } from "@/lib/database";
import Movement from "@/models/Movement";

export default async function handler(req, res) {
  await connectDB();

  const { sku, user, movementType, date, time } = req.query;
  const limit = 1000; // Limitar a los últimos 1000 registros

  let filter = {};

  if (sku && sku !== "all") filter["products.sku"] = sku;
  if (user && user !== "all") filter.user = user;
  if (movementType && movementType !== "all") filter.type = movementType;

  // Ajustar el filtro de fecha para un rango del día completo
  if (date) {
    const selectedDate = new Date(date);
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + 1);

    filter.date = {
      $gte: selectedDate, // Inicio del día seleccionado
      $lt: nextDate,      // Fin del día seleccionado
    };
  }

  if (time) filter.time = time;

  try {
    const movements = await Movement.find(filter)
      .sort({ date: -1 }) // Ordenar por fecha descendente para obtener los últimos registros
      .limit(limit)
      .lean(); // Mejorar rendimiento con `lean`

    res.status(200).json({ movements });
  } catch (error) {
    console.error("Error al exportar movimientos:", error);
    res.status(500).json({ error: "Error al exportar movimientos" });
  }
}
