import axios from "axios";

export default async function handler(req, res) {
  const { method, query } = req;

  if (method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { id, storeId, accessToken } = query;
  console.log(storeId);

  if (!storeId || !accessToken) {
    return res.status(400).json({ message: "Missing storeId or accessToken" });
  }

  if (!id) {
    return res.status(400).json({ message: "Missing order ID" });
  }


console.log(storeId, id)

  const url = `https://api.tiendanube.com/v1/${storeId}/orders/${id}`;
  const headers = {
    Authentication: `bearer ${accessToken}`,
    "User-Agent": "E-full (softwaredublin83@gmail.com)",
  };

  try {
    const { data, status } = await axios.get(url, {
      headers,
      maxBodyLength: Infinity,
    });

    if (status === 200 && data) {
      return res.status(200).json({
        status: "order-found",
        data,
        message: "Order found and loaded successfully.",
      });
    }

    return res.status(500).json({
      status: "unexpected-response",
      message: "Unexpected response from Tiendanube API.",
    });
  } catch (error) {
    if (error.response) {
      const { status } = error.response;
      if (status === 404) {
        return res.status(404).json({
          status: "order-not-found",
          message: "No order found with the provided ID.",
        });
      }

      return res.status(status).json({
        status: "error",
        message: error.response.data?.message || "Error with Tiendanube API.",
      });
    }

    return res.status(500).json({
      status: "error",
      message: "An unexpected error occurred.",
    });
  }
}
