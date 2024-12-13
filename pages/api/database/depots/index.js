// pages/api/depots/index.js

import { connectDB } from "@/lib/database";
import Depot from "@/models/Depot";
import Movement from "@/models/Movement";

export default async function handler(req, res) {
  await connectDB();

  switch (req.method) {
    case "GET":
      try {
        const { page = 1, itemsPerPage = 10 } = req.query;
        const skipItems = (parseInt(page) - 1) * parseInt(itemsPerPage);

        // Calcular el total de elementos en `currentStock`
        const totalItems = await Depot.aggregate([
          { $unwind: "$currentStock" },
          { $count: "total" },
        ]);

        const totalItemsCount = totalItems[0]?.total || 0;
        const totalPages = Math.ceil(totalItemsCount / parseInt(itemsPerPage));

        // Obtener los depósitos con paginación en `currentStock`
        const depots = await Depot.find({})
          .select("name location currentStock movements")
          .populate({
            path: "movements",
            options: { skip: skipItems, limit: parseInt(itemsPerPage) },
          })
          .lean();

        // Paginación manual de `currentStock` después de la consulta
        depots.forEach((depot) => {
          depot.currentStock = depot.currentStock?.slice(skipItems, skipItems + parseInt(itemsPerPage)) || [];
        });

        res.status(200).json({
          depots,
          totalPages,
          currentPage: parseInt(page),
          itemsPerPage: parseInt(itemsPerPage),
        });
      } catch (error) {
        console.error("Error en GET /depots:", error);
        res.status(500).json({ error: "Error al obtener los depósitos" });
      }
      break;

    case "POST":
      try {
        if (!req.body || !req.body.name || !req.body.location) {
          return res.status(400).json({ error: "Faltan datos necesarios para crear el depósito" });
        }
        
        const depot = new Depot(req.body);
        await depot.save();
        res.status(201).json(depot);
      } catch (error) {
        console.error("Error en POST /depots:", error);
        res.status(400).json({
          error: "Error al crear el depósito",
          details: error.message,
        });
      }
      break;

    case "PUT":
      try {
        const { depotId, sku, quantity, mode } = req.body;

        // Validar datos requeridos
        if (!depotId || !sku || quantity === undefined || !mode) {
          return res.status(400).json({ error: "Faltan datos necesarios para actualizar el depósito" });
        }

        // Buscar el depósito por ID
        const depot = await Depot.findById(depotId);
        if (!depot) {
          return res.status(404).json({ error: "Depósito no encontrado" });
        }

        // Buscar el stock del SKU específico en el depósito
        const stockItem = depot.currentStock.find((item) => item.sku === sku);
        if (!stockItem) {
          return res.status(404).json({ error: `El SKU ${sku} no se encuentra en el depósito` });
        }

        switch (mode) {
          case "quality_control":
            stockItem.qualityControl = (stockItem.qualityControl || 0) + quantity;
            break;

          case "defects":
            stockItem.damaged = (stockItem.damaged || 0) + quantity;
            break;

          case "shelf":
            stockItem.shelf = (stockItem.shelf || 0) + quantity;
            break;

          case "reserve":
            if (stockItem.shelf < quantity) {
              return res.status(400).json({ error: "Stock insuficiente para reservar" });
            }
            stockItem.shelf -= quantity;
            stockItem.reserved = (stockItem.reserved || 0) + quantity;
            break;

          default:
            return res.status(400).json({ error: "Modo de actualización inválido" });
        }

        // Guardar los cambios en el depósito
        await depot.save();
        res.status(200).json({ message: "Stock actualizado con éxito", depot });
      } catch (error) {
        console.error("Error en PUT /depots:", error);
        res.status(400).json({
          error: "Error al actualizar el depósito",
          details: error.message,
        });
      }
      break;

    default:
      res.status(405).json({ error: "Método no permitido" });
      break;
  }
}
