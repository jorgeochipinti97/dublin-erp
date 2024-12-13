import Movement from "@/models/Movement";
import Depot from "@/models/Depot";
import { connectDB } from "@/lib/database";

export default async function handler(req, res) {
  await connectDB();

  switch (req.method) {
    case "POST": {
      const { products, depotId, state, user, storeIds } = req.body;

      try {
        const depot = await Depot.findById(depotId);

        if (!depot) {
          return res.status(404).json({ error: "Depósito no encontrado" });
        }

        if (!storeIds || !Array.isArray(storeIds) || storeIds.length === 0) {
          return res.status(400).json({
            error: "Se requiere al menos una tienda asociada para crear el movimiento.",
          });
        }

        for (const product of products) {
          const { idNuve, sku, quantity } = product;

          if (!quantity || quantity <= 0) {
            return res.status(400).json({
              error: "Cada producto debe tener una cantidad válida",
            });
          }

          let stockItem = depot.currentStock.find(
            (item) =>
              (item.idNuve && item.idNuve === idNuve) ||
              (item.sku && item.sku === sku)
          );

          if (!stockItem) {
            stockItem = {
              idNuve: idNuve || `null-${new Date().toISOString()}`,
              sku: sku || `null-${new Date().toISOString()}`,
              qualityControl: state === "quality_control" ? quantity : 0,
              damaged: state === "defects" ? quantity : 0,
              shelf: state === "shelf" ? quantity : 0,
              reserved: 0,
              dispatched: 0,
              damagedDepot: 0,
              provider: 0,
            };
            depot.currentStock.push(stockItem);
          } else {
            if (!stockItem.idNuve && idNuve) stockItem.idNuve = idNuve;
            if (!stockItem.sku && sku) stockItem.sku = sku;

            switch (state) {
              case "quality_control":
                stockItem.qualityControl += quantity;
                break;
              case "defects":
                stockItem.damaged += quantity;
                break;
              case "shelf":
                stockItem.shelf += quantity;
                break;
              case "reserve":
                if (stockItem.shelf < quantity) {
                  return res.status(400).json({
                    error: `Stock insuficiente en estantería para reservar el producto: ${sku}`,
                  });
                }
                stockItem.shelf -= quantity;
                stockItem.reserved += quantity;
                break;
              default:
                return res.status(400).json({
                  error: `Estado de stock inválido: ${state}`,
                });
            }
          }
        }

        await depot.save();

        const movement = new Movement({
          products: products.map(({ idNuve, sku, quantity }) => ({
            idNuve,
            sku,
            quantity,
          })),
          depot: depot._id,
          stores: storeIds,
          date: new Date(),
          type: state,
          user,
        });

        await movement.save();

        depot.movements.push(movement._id);
        await depot.save();

        res.status(201).json(movement);
      } catch (error) {
        res.status(500).json({
          error: "Error interno del servidor",
          details: error.message,
        });
      }

      break;
    }

    default:
      res.status(405).json({ error: "Método no permitido" });
      break;
  }
}
