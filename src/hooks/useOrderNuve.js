import { useState, useEffect } from "react";
import axios from "axios";

// Hook para buscar una orden por su ID
export const useOrderById = (orderId) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`/api/ordernuve?id=${orderId}`);
        if (response.status === 200) {
          setOrder(response.data.data);
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setError("Order not found");
        } else {
          setError("An error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  return { order, loading, error };
};
