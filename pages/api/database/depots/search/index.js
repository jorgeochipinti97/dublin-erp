// pages/api/depots/searchAllProducts.js

import { connectDB } from "@/lib/database";
import Depot from "@/models/Depot";

export default async function handler(req, res) {
  await connectDB(); // Conectar a la base de datos

  const { searchQuery } = req.query;

  switch (req.method) {
    case "GET":
      try {
        // Obtener todos los productos en currentStock de todos los depósitos
        const depots = await Depot.find({}).select("currentStock");

        // Aplanar y filtrar los productos según el criterio de búsqueda
        const allProducts = depots
          .flatMap((depot) => depot.currentStock)
          .filter((product) =>
            product.sku.toLowerCase().includes(searchQuery.toLowerCase())
          );

        res.status(200).json({ products: allProducts });
      } catch (error) {
        console.error("Error al buscar en el inventario:", error);
        res.status(500).json({ error: "Error al buscar en el inventario" });
      }
      break;

    default:
      res.status(405).json({ error: "Método no permitido" });
      break;
  }
}
