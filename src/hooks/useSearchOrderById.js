import axios from "axios";
import { useState, useEffect } from "react";
import { useSupabaseData } from "./useSupabaseData";

export const useSearchOrderById = () => {
  const { ordersSupabase, loading: loadingSupabase } = useSupabaseData();
  const [orderDetails, setOrderDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (loadingSupabase) return;

    const fetchOrderDetails = async () => {
      setLoading(true);
      try {
        const orderDetailsPromises = ordersSupabase.map(({ order_id }) =>
          fetchOrder(order_id)
        );
        const details = await Promise.all(orderDetailsPromises);
        setOrderDetails(details);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [ordersSupabase, loadingSupabase]);

  const fetchOrder = async (orderId) => {
    const headers = {
      Authentication: "Bearer 815c1929afc4c2438cf9bdc86224d05893b10d95",
      "User-Agent": "E-full (softwaredublin83@gmail.com)",
    };
    try {
      const response = await axios.get(`/api/ordernuve`, {
        params: { id: orderId },
        headers,
      });
      console.log(response);
      return response.data;
    } catch (err) {
      console.error("Error fetching order data:", err); // Asegúrate de registrar el error real para depuración
      setError("Error fetching order data");
      return null; // Devuelve null o algún valor por defecto en caso de error
    }
  };

  return { orderDetails, loading, error };
};
