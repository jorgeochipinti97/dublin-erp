// /pages/api/depots/product/[sku].js

import { connectDB } from "@/lib/database";
import Depot from "@/models/Depot";

export default async function handler(req, res) {
  await connectDB(); // Conectar a la base de datos

  const { sku, fromState, requiredQuantity } = req.query; // Usamos `sku` como identificador genérico
  const depotId = "675c2ff50dbee3651aa8af53"; // ID fijo del depósito

  switch (req.method) {
    case "GET":
      try {
        // Validar que se proporcione un estado de origen (`fromState`)
        if (!fromState) {
          return res
            .status(400)
            .json({ error: "El parámetro 'fromState' es requerido" });
        }

        // Buscar el depósito con el ID fijo proporcionado y seleccionar solo `currentStock`
        const depot = await Depot.findById(depotId).select("currentStock");
        if (!depot) {
          return res.status(404).json({ error: "Depósito no encontrado" });
        }

        // Buscar el producto por SKU o idNuve en el stock del depósito
        const product = depot.currentStock.find(
          (item) => item.sku === sku || item.idNuve === sku // Usamos `sku` como identificador genérico
        );

        if (!product) {
          return res
            .status(404)
            .json({
              error: `Producto con identificador ${sku} no encontrado en el depósito`,
            });
        }

        const availableQuantity = product[fromState] || 0;

        // Si `requiredQuantity` está presente, verificar si el stock es suficiente
        if (requiredQuantity) {
          if (availableQuantity >= Number(requiredQuantity)) {
            return res.status(200).json({ available: true, availableQuantity });
          } else {
            return res.status(200).json({ available: false, availableQuantity });
          }
        }

        // Si `requiredQuantity` no está presente, devolver si hay stock disponible
        return res
          .status(200)
          .json({ available: availableQuantity > 0, availableQuantity });
      } catch (error) {
        console.error("Error al verificar el producto en el depósito:", error);
        res
          .status(500)
          .json({ error: "Error al verificar el producto en el depósito" });
      }
      break;

    default:
      res.status(405).json({ error: "Método no permitido" });
      break;
  }
}
