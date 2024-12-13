
import { connectDB } from "@/lib/database";
import IndividualProduct from "@/models/IndividualProduct";

export default async function handler(req, res) {
  await connectDB();
  const { method } = req;

  switch (method) {
    case "GET": {
      try {
        // Obtener todos los productos individuales
        const products = await IndividualProduct.find({});
        return res.status(200).json({
          message: "Productos individuales obtenidos con éxito.",
          products,
        });
      } catch (error) {
        console.error("Error al obtener productos individuales:", error);
        return res.status(500).json({
          error: "Error al obtener productos individuales.",
          details: error.message,
        });
      }
    }

    case "POST": {
      try {
        const { name, sku, stock, associatedVariants } = req.body;

        // Validar campos obligatorios
        if (!name || !sku) {
          return res.status(400).json({
            error: "Los campos 'name' y 'sku' son obligatorios.",
          });
        }

        // Crear producto individual
        const newProduct = await IndividualProduct.create({
          name,
          sku,
          stock: stock || { shelf: 0, qualityControl: 0, damaged: 0, reserved: 0 },
          associatedVariants: associatedVariants || [],
        });

        return res.status(201).json({
          message: "Producto individual creado con éxito.",
          product: newProduct,
        });
      } catch (error) {
        console.error("Error al crear el producto individual:", error);
        return res.status(500).json({
          error: "Error al crear el producto individual.",
          details: error.message,
        });
      }
    }

    case "PUT": {
      return res.status(400).json({
        error: "PUT no está permitido en este endpoint. Usa /api/individual-product/[id].js.",
      });
    }

    case "DELETE": {
      return res.status(400).json({
        error: "DELETE no está permitido en este endpoint. Usa /api/individual-product/[id].js.",
      });
    }

    default:
      return res.status(405).json({
        error: `Método ${method} no permitido.`,
        allowedMethods: ["GET", "POST"],
      });
  }
}
