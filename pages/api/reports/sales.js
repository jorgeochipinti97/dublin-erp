

import { fetchAllOrders, processOrders } from '@/lib/utils';


export default async function handler(req, res) {
  try {

    const params = { ...req.query, page: 1, per_page: 50 };


    const orders = await fetchAllOrders(params);


    const reportData = processOrders(orders);

    // Responde con el reporte en formato JSON
    res.status(200).json({ report: reportData });
  } catch (error) {
    console.error('Error al obtener datos:', error);
    res.status(500).json({ error: 'Error al generar el reporte' });
  }
}
