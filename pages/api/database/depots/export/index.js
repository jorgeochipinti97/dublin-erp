// pages/api/database/depots/export.js

import { connectDB } from "@/lib/database";
import Depot from "@/models/Depot";

export default async function handler(req, res) {
  await connectDB();

  const { group } = req.query;
  const limit = 300; // Limitar a los últimos 300 registros

  try {
    let filter = {};

    // Solo aplicar filtro si `group` es diferente de "all"
    if (group && group !== "all") {
      filter = { "currentStock.sku": group };
    }

    // Obtener los depósitos con o sin filtro y seleccionar solo `currentStock` con el límite de 300
    const depots = await Depot.find(filter)
      .select("currentStock")
      .limit(limit)
      .lean();

    // Aplanar todos los productos en `currentStock` en un solo array
    const allProducts = depots.flatMap((depot) => depot.currentStock);

    console.log("Productos exportados:", allProducts); // Verificar que contiene datos cuando `group` es "all" o filtrado

    res.status(200).json({ products: allProducts });
  } catch (error) {
    console.error("Error al exportar los depósitos:", error);
    res.status(500).json({ error: "Error al exportar los depósitos" });
  }
}
