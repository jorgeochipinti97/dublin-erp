import Movement from "@/models/Movement";
import Depot from "@/models/Depot";
import { connectDB } from "@/lib/database";

export default async function handler(req, res) {
  await connectDB();

  switch (req.method) {
    case "POST": {
      const { products, depotId, fromState, toState, user, storeIds } = req.body; // Agregar `storeIds`

      try {
        // Validar depósito
        const depot = await Depot.findById(depotId);
        if (!depot) {
          return res.status(404).json({ error: "Depósito no encontrado" });
        }

        // Validar tiendas (Obligatorio en POST)
        if (!storeIds || !Array.isArray(storeIds) || storeIds.length === 0) {
          return res
            .status(400)
            .json({ error: "Se requiere al menos una tienda asociada para crear el movimiento." });
        }

        for (const product of products) {
          let stockItem = depot.currentStock.find(
            (item) => item.sku === product.sku
          );

          if (!stockItem) {
            return res.status(404).json({
              error: `Producto con SKU ${product.sku} no encontrado en el depósito`,
            });
          }

          // Validación del stock disponible en fromState
          if (stockItem[fromState] < product.quantity) {
            return res.status(400).json({
              error: `Stock insuficiente en ${fromState} para SKU ${product.sku}`,
            });
          }

          // Transferir el stock de fromState a toState
          stockItem[fromState] -= product.quantity;
          stockItem[toState] += product.quantity;
        }

        await depot.save(); // Guardar cambios en el depósito

        // Crear y guardar el movimiento interno
        const movement = new Movement({
          products,
          depot: depot._id,
          stores: storeIds, // Asociar las tiendas
          date: new Date(),
          fromState,
          toState,
          user,
        });
        await movement.save();

        depot.movements.push(movement._id);
        await depot.save();

        res.status(201).json(movement);
      } catch (error) {
        console.error("Error al procesar el movimiento interno:", error.message);
        res.status(500).json({ error: "Error interno del servidor" });
      }
      break;
    }

    default:
      res.status(405).json({ error: "Método no permitido" });
      break;
  }
}
