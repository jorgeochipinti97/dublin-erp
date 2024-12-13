import { connectDB } from "@/lib/database";
import IndividualProduct from "@/models/IndividualProduct";
import mongoose from "mongoose";

export default async function handler(req, res) {
  const { id } = req.query;
  await connectDB();

  switch (req.method) {
    case "GET":
      try {
        let product;

        // Determinar si el ID es un ObjectId válido
        if (mongoose.Types.ObjectId.isValid(id)) {
          product = await IndividualProduct.findById(id);
        } else {
          product = await IndividualProduct.findOne({ sku: id });
        }

        if (!product) {
          return res.status(404).json({ error: "Producto no encontrado" });
        }

        res.status(200).json(product);
      } catch (error) {
        console.error("Error al obtener el producto:", error);
        res.status(500).json({ error: "Error al obtener el producto" });
      }
      break;

    case "PUT":
      try {
        let product;

        if (mongoose.Types.ObjectId.isValid(id)) {
          product = await IndividualProduct.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
          });
        } else {
          product = await IndividualProduct.findOneAndUpdate(
            { sku: id },
            req.body,
            {
              new: true,
              runValidators: true,
            }
          );
        }

        if (!product) {
          return res.status(404).json({ error: "Producto no encontrado" });
        }

        res.status(200).json(product);
      } catch (error) {
        console.error("Error al actualizar el producto:", error);
        res.status(400).json({ error: "Error al actualizar el producto" });
      }
      break;

    case "DELETE":
      try {
        let product;

        if (mongoose.Types.ObjectId.isValid(id)) {
          product = await IndividualProduct.findByIdAndDelete(id);
        } else {
          product = await IndividualProduct.findOneAndDelete({ sku: id });
        }

        if (!product) {
          return res.status(404).json({ error: "Producto no encontrado" });
        }

        res.status(200).json({ message: "Producto eliminado correctamente" });
      } catch (error) {
        console.error("Error al eliminar el producto:", error);
        res.status(500).json({ error: "Error al eliminar el producto" });
      }
      break;

    default:
      res.status(405).json({ error: "Método no permitido" });
      break;
  }
}
