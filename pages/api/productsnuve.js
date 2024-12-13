import axios from "axios";

export default async function handler(req, res) {
  const { storeId, accessToken, page = 1, per_page = 50 } = req.query;

  // Validar que los parámetros requeridos estén presentes
  if (!storeId || !accessToken) {
    return res.status(400).json({ error: "Faltan storeId o accessToken" });
  }

  const pageNumber = parseInt(page, 10);
  const perPageNumber = parseInt(per_page, 10);

  try {
    // Obtener la cantidad total de productos para la paginación
    const initialResponse = await axios.get(
      `https://api.tiendanube.com/v1/${storeId}/products`,
      {
        params: {
          page: 1, // Primera página para obtener el total
          per_page: perPageNumber,
        },
        headers: {
          Authentication: `bearer ${accessToken}`,
          "User-Agent": "E-full (softwaredublin83@gmail.com)",
        },
      }
    );

    const totalProducts = parseInt(initialResponse.headers["x-total-count"], 10);
    const totalPages = Math.ceil(totalProducts / perPageNumber);

    // Validar que la página solicitada no exceda las páginas disponibles
    if (pageNumber > totalPages) {
      return res.status(404).json({
        error: `La página solicitada no existe. La última página disponible es ${totalPages}`,
      });
    }

    // Obtener los productos de la página solicitada
    const response = await axios.get(
      `https://api.tiendanube.com/v1/${storeId}/products`,
      {
        params: {
          page: pageNumber,
          per_page: perPageNumber,
        },
        headers: {
          Authentication: `bearer ${accessToken}`,
          "User-Agent": "E-full (softwaredublin83@gmail.com)",
        },
      }
    );

    // Retornar los productos junto con la información de paginación
    return res.status(200).json({
      products: response.data,
      totalProducts,
      totalPages,
      currentPage: pageNumber,
    });
  } catch (error) {
    console.error("Error al obtener productos:", error.message);
    return res.status(500).json({
      error: "Error al obtener los productos",
      message: error.message,
    });
  }
}
