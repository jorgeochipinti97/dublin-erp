import Movement from "@/models/Movement";
import IndividualProduct from "@/models/IndividualProduct";
import { connectDB } from "@/lib/database";

export default async function handler(req, res) {
  await connectDB();

  const { method } = req;

  switch (method) {
    case "POST": {
      try {
        const { products, state, user } = req.body;

        if (!products || !Array.isArray(products) || products.length === 0) {
          return res.status(400).json({
            error:
              "Se requiere una lista de productos para realizar el movimiento.",
          });
        }

        if (!state) {
          return res.status(400).json({
            error: "El estado del movimiento es obligatorio.",
          });
        }

        if (!user) {
          return res.status(400).json({
            error: "El nombre del usuario es obligatorio.",
          });
        }

        const updatedProducts = [];

        for (const product of products) {
          const { sku, quantity } = product;

          if (!sku || !quantity || quantity <= 0) {
            return res.status(400).json({
              error: "Cada producto debe tener un SKU y una cantidad válida.",
            });
          }

          const individualProduct = await IndividualProduct.findOne({ sku });

          if (!individualProduct) {
            return res.status(404).json({
              error: `Producto individual con SKU ${sku} no encontrado.`,
            });
          }

          switch (state) {
            case "quality_control":
              individualProduct.stock.qualityControl += quantity;
              break;
            case "defects":
              individualProduct.stock.damaged += quantity;
              break;
            case "shelf":
              individualProduct.stock.shelf += quantity;
              break;
            case "reserve":
              if (individualProduct.stock.shelf < quantity) {
                return res.status(400).json({
                  error: `Stock insuficiente en estantería para reservar el producto con SKU ${sku}.`,
                });
              }
              individualProduct.stock.shelf -= quantity;
              individualProduct.stock.reserved += quantity;
              break;
            default:
              return res.status(400).json({
                error: `Estado de stock inválido: ${state}.`,
              });
          }

          await individualProduct.save();
          updatedProducts.push(individualProduct);
        }

        const movement = new Movement({
          products: updatedProducts.map((prod) => ({
            idNuve: prod.idNuve,
            sku: prod.sku,
            quantity: products.find((p) => p.sku === prod.sku).quantity,
          })),
          user,
          type: state,
          date: new Date(),
        });

        await movement.save();

        res.status(201).json({
          message: "Movimiento creado y productos actualizados exitosamente.",
          movement,
          updatedProducts,
        });
      } catch (error) {
        console.error("Error al procesar el movimiento:", error.message);
        res.status(500).json({
          error: "Error interno del servidor.",
          details: error.message,
        });
      }
      break;
    }

    case "GET": {
      try {
        const { page = 1, limit = 30 } = req.query;

        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);

        const movements = await Movement.find({})
          .populate("products.product")
          .sort({ date: -1 })
          .skip((pageNumber - 1) * limitNumber)
          .limit(limitNumber);

        const totalMovements = await Movement.countDocuments();

        res.status(200).json({
          movements,
          totalMovements,
          currentPage: pageNumber,
          totalPages: Math.ceil(totalMovements / limitNumber),
        });
      } catch (error) {
        console.error("Error al obtener movimientos:", error.message);
        res.status(500).json({
          error: "Error interno del servidor.",
          details: error.message,
        });
      }
      break;
    }

    default:
      res.status(405).json({
        error: `Método ${method} no permitido.`,
        allowedMethods: ["POST", "GET"],
      });
      break;
  }
}
