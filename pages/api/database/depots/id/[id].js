// pages/api/depots/[id].js


import { connectDB } from '@/lib/database';
import Depot from '@/models/Depot';

export default async function handler(req, res) {
  await connectDB();
  
  const { id } = req.query;

  switch (req.method) {
    case 'GET':
      try {
        const depot = await Depot.findById(id);
        if (!depot) {
          return res.status(404).json({ error: 'Depósito no encontrado' });
        }
        res.status(200).json(depot);
      } catch (error) {
        res.status(500).json({ error: 'Error al obtener el depósito' });
      }
      break;

    case 'PUT':
      try {
        const depot = await Depot.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!depot) {
          return res.status(404).json({ error: 'Depósito no encontrado' });
        }
        res.status(200).json(depot);
      } catch (error) {
        res.status(400).json({ error: 'Error al actualizar el depósito', details: error.message });
      }
      break;

    case 'DELETE':
      try {
        const depot = await Depot.findByIdAndDelete(id);
        if (!depot) {
          return res.status(404).json({ error: 'Depósito no encontrado' });
        }
        res.status(200).json({ message: 'Depósito eliminado correctamente' });
      } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el depósito' });
      }
      break;

    default:
      res.status(405).json({ error: 'Método no permitido' });
      break;
  }
}
