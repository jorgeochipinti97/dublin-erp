import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send({ message: 'Only POST requests are allowed' });
  }

  const { productId, variantId, stock } = req.body;

  try {
    const response = await axios.put(
      `https://api.tiendanube.com/v1/products/${productId}/variants/${variantId}`,
      {
        stock_management: true,
        stock: stock,
      },
      {
        headers: {
          'Authentication': 'Bearer YOUR_ACCESS_TOKEN',
          'Content-Type': 'application/json',
        },
      }
    );
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Error updating stock' });
  }
}
