import Movement from "@/models/Movement";
import Depot from "@/models/Depot";
import { connectDB } from "@/lib/database";

export default async function handler(req, res) {
  await connectDB();

  switch (req.method) {
    case "POST":
      const { products, depotId, fromState, toState, user } = req.body;

      try {
        // Validar depósito
        const depot = await Depot.findById(depotId);
        if (!depot) {
          return res.status(404).json({ error: "Depósito no encontrado" });
        }

        console.log("Depósito encontrado:", depot);

        // Procesar productos
        for (const product of products) {
          console.log("Procesando producto:", product);

          // Buscar producto por `sku` o `idNuve`
          const stockItem = depot.currentStock.find(
            (item) => item.sku === product.sku || item.idNuve === product.sku
          );

          if (!stockItem) {
            return res.status(404).json({
              error: `Producto con identificador ${product.sku} no encontrado en el depósito`,
            });
          }

          console.log("Producto encontrado en el stock:", stockItem);

          // Validar stock disponible en `fromState`
          if (stockItem[fromState] < product.quantity) {
            return res.status(400).json({
              error: `Stock insuficiente en ${fromState} para el identificador ${product.sku}`,
            });
          }

          // Transferir el stock de `fromState` a `toState`
          stockItem[fromState] -= product.quantity;
          stockItem[toState] += product.quantity;

          console.log(
            `Stock actualizado para el identificador ${product.sku}:`,
            stockItem
          );
        }

        console.log("Guardando cambios en el depósito...");
        await depot.save();

        // Crear y guardar el movimiento interno
        console.log("Creando nuevo movimiento...");
        const movement = new Movement({
          products,
          depot: depot._id,
          fromState,
          toState,
          type: "internal", // Tipo de movimiento interno
          date: new Date(),
          user,
        });

        await movement.save();
        console.log("Movimiento creado:", movement);

        res.status(201).json(movement);
      } catch (error) {
        console.error("Error al procesar el movimiento:", error.message);
        res.status(500).json({ error: "Error interno del servidor" });
      }
      break;

    default:
      res.status(405).json({ error: "Método no permitido" });
      break;
  }
}
