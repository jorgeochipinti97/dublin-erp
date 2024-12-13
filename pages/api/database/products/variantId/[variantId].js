
import { connectDB } from "@/lib/database";
import IndividualProduct from "@/models/IndividualProduct";

export default async function handler(req, res) {
  const { variantId } = req.query; // `variantId` recibido en la query
  await connectDB();

  switch (req.method) {
    case "GET":
      try {
        if (!variantId) {
          return res.status(400).json({ error: "El variantId es requerido." });
        }

        // Buscar productos individuales asociados al variantId
        const products = await IndividualProduct.find({
          "associatedVariants.variantId": variantId,
        });

        if (products.length === 0) {
          return res.status(404).json({ error: "No se encontraron productos para esta variante." });
        }

        res.status(200).json(products);
      } catch (error) {
        console.error("Error al buscar productos por variantId:", error);
        res.status(500).json({ error: "Error al buscar productos." });
      }
      break;

    default:
      res.status(405).json({ error: "Método no permitido." });
      break;
  }
}
