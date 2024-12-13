// pages/api/database/orders/id/[id].js
import { connectDB } from '@/lib/database';
import Order from '@/models/Order';

export default async function handler(req, res) {
  const { id } = req.query;  // Captura el ID de la consulta
  await connectDB();

  switch (req.method) {
    case 'GET':
      try {
        const order = await Order.findById(id);
        if (!order) {
          return res.status(404).json({ error: 'Orden no encontrada' });
        }
        res.status(200).json(order);
      } catch (error) {
        res.status(500).json({ error: 'Error al obtener la orden' });
      }
      break;

    case 'PUT':
      try {
        const order = await Order.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true,
        }).populate('store')
          .populate('managedBy');
        if (!order) {
          return res.status(404).json({ error: 'Orden no encontrada' });
        }
        res.status(200).json(order);
      } catch (error) {
        res.status(400).json({ error: 'Error al actualizar la orden' });
      }
      break;

    case 'DELETE':
      try {
        const order = await Order.findByIdAndDelete(id);
        if (!order) {
          return res.status(404).json({ error: 'Orden no encontrada' });
        }
        res.status(200).json({ message: 'Orden eliminada correctamente' });
      } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la orden' });
      }
      break;

    default:
      res.status(405).json({ error: 'Método no permitido' });
      break;
  }
}
