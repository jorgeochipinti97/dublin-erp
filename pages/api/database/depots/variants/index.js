// pages/api/depots/variants.js

import { connectDB } from '@/lib/database';
import Depot from '@/models/Depot';

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'GET') {
    try {
      // Extraer todas las variantes únicas de `sku` en `currentStock`
      const variants = await Depot.aggregate([
        { $unwind: "$currentStock" },
        { $group: { _id: "$currentStock.sku" } }, // Agrupar por SKU para obtener valores únicos
        { $sort: { _id: 1 } } // Ordenar los SKUs
      ]);

      // Extraer solo el campo SKU y construir el array
      const variantArray = variants.map((variant) => variant._id);

      res.status(200).json({ variants: variantArray });
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener las variantes de los productos' });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}
