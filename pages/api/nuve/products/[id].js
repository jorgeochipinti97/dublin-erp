import axios from "axios";

export default async function handler(req, res) {
  const { id, storeId, accessToken } = req.query;
  console.log(id, storeId, accessToken);
  // Verificar si se proporcionaron los parámetros necesarios
  if (!id || !storeId || !accessToken) {
    return res
      .status(400)
      .json({ error: "Faltan parámetros: id, storeId o accessToken" });
  }

  try {
    // Solicitud a la API de Tiendanube para obtener un producto específico
    const response = await axios.get(
      `https://api.tiendanube.com/v1/${storeId}/products/${id}`,
      {
        headers: {
          Authentication: `bearer ${accessToken}`,
          "User-Agent": "E-full (softwaredublin83@gmail.com)",
        },
      }
    );

    console.log(`https://api.tiendanube.com/v1/${storeId}/products/${id}`);

    res.status(200).json(response.data);
  } catch (error) {
    console.log(`https://api.tiendanube.com/v1/${storeId}/products/${id}`);
    console.log(error);
    console.log("Error al obtener el producto de Tiendanube:", error.message);
    res.status(error.response?.status || 500).json({
      error: "Error al obtener el producto de Tiendanube",
      message: error.message,
    });
  }
}
