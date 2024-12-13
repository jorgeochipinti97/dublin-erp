import axios from "axios";

export default async function handler(req, res) {
  const { sku, storeId, accessToken } = req.query;

  // Verificar si se proporcionaron los parámetros necesarios
  if (!sku || !storeId || !accessToken) {
    return res.status(400).json({ error: "Faltan parámetros: sku, storeId o accessToken" });
  }

  console.log("SKU:", sku);
  console.log("Store ID:", storeId);
  console.log("Access Token:", accessToken);

  try {
    const response = await axios.get(
      `https://api.tiendanube.com/v1/${storeId}/products/sku/${sku}`,
      {
        headers: {
          Authentication: `bearer ${accessToken}`,
          "User-Agent": "E-full (softwaredublin83@gmail.com)",
        },
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error al obtener el producto de Tiendanube:", error.message);
    res.status(error.response?.status || 500).json({ error: error.message });
  }
}
