import mongoose from "mongoose";
import Store from "@/models/Store";
import { connectDB } from "@/lib/database";

export default async function handler(req, res) {
  await connectDB();

  switch (req.method) {
    case "GET":
      try {
        const stores = await Store.find({});
        res.status(200).json(stores);
      } catch (error) {
        res.status(500).json({ error: "Error al obtener las tiendas" });
      }
      break;

    case "POST":
      try {
        const storeData = {
          ...req.body,
        };

        const store = new Store(storeData);
        await store.save();
        res.status(201).json(store);
      } catch (error) {
        res
          .status(400)
          .json({ error: "Error al crear la tienda", details: error.message });
      }
      break;

    case "DELETE":
      try {
        const { id } = req.query; // Obtener el ID de la tienda desde la query

        if (!id) {
          return res
            .status(400)
            .json({ error: "Se requiere el ID de la tienda para eliminarla" });
        }

        const deletedStore = await Store.findByIdAndDelete(id);

        if (!deletedStore) {
          return res
            .status(404)
            .json({ error: "No se encontró la tienda especificada" });
        }

        res
          .status(200)
          .json({ message: "Tienda eliminada con éxito", store: deletedStore });
      } catch (error) {
        res
          .status(500)
          .json({ error: "Error al eliminar la tienda", details: error.message });
      }
      break;

    default:
      res.status(405).json({ error: "Método no permitido" });
      break;
  }
}
