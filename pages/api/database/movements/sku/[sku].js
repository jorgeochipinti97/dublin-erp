// /pages/api/database/sku/[sku].js
import Movement from '@/models/Movement';
import { connectDB } from '@/lib/database';

export default async function handler(req, res) {
  const { sku } = req.query;
  await connectDB();

  if (req.method === 'GET') {
    try {
      // Buscar todos los movimientos que contengan el SKU en los productos
      const movements = await Movement.find({
        'products.sku': sku,
      });
      

      if (!movements || movements.length === 0) {
        return res.status(404).json({ error: 'No se encontraron movimientos para el SKU proporcionado' });
      }

      res.status(200).json(movements);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener los movimientos' });
    }
  } else {
    // Si el método no es GET, respondemos con un error 405 (Método no permitido)
    res.status(405).json({ error: 'Método no permitido' });
  }
}
