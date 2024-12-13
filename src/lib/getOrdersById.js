"use server";

import axios from "axios";

export const getOrder = async (id) => {
  try {
    const url = `https://api.tiendanube.com/v1/1935431/orders/${id}`;
    const response = await axios.get(url, {
      headers: {
        Authorization: "bearer 815c1929afc4c2438cf9bdc86224d05893b10d95",
        "User-Agent": "E-full (softwaredublin83@gmail.com)",
      },
    });

    console.log(response.data)
    return response.data;
} catch (error) {
    console.error(`Error fetching order ${id}:`, error);
    throw error;
  }
};
