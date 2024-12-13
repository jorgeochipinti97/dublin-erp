import axios from "axios";

export default async function handler(req, res) {
  const limit = 50; // Límite de productos por página
  let page = 1; // Página inicial
  let allVariants = []; // Array para almacenar todas las variantes
  let hasMore = true; // Control de paginación

  try {
    while (hasMore) {
      const response = await axios.get(
        `https://api.tiendanube.com/v1/1935431/products`,
        {
          headers: {
            Authentication: `bearer 815c1929afc4c2438cf9bdc86224d05893b10d95`,
            "User-Agent": "E-full (softwaredublin83@gmail.com)",
          },
          params: {
            page, // Página actual
            per_page: limit, // Cantidad de productos por página
          },
        }
      );

      const products = response.data;

      // Si no se devuelven productos o se alcanza la última página, detenemos el bucle
      if (products.length === 0) {
        hasMore = false;
      } else if (response.headers["x-total-count"]) {
        const totalItems = parseInt(response.headers["x-total-count"], 10);
        const totalPages = Math.ceil(totalItems / limit);

        // Si estamos en la última página, salimos del bucle
        if (page >= totalPages) {
          hasMore = false;
        }

        // Extraer variantes de cada producto y agregarlas al array
        const variants = products.flatMap((product) =>
          product.variants.map((variant) => {
            const variantValues = variant.values?.map((value) => value.es).join(" / ") || "";
            const productName = product.name.es || product.name.en; // Nombre del producto

            // Retornar el nombre del producto combinado con los valores de la variante
            return {
              productName: `${productName} - ${variantValues}`, // Nombre del producto con valores de la variante
              sku: variant.sku, // SKU de la variante
            };
          })
        );

        allVariants = [...allVariants, ...variants];
        page++; // Avanzar a la siguiente página
      }
    }

    res.status(200).json({ variants: allVariants });
  } catch (error) {
    console.error("Error fetching variants from Tiendanube:", error.response?.data || error.message);
    res.status(500).json({ error: "Error fetching variants from Tiendanube" });
  }
}
