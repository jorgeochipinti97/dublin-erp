import { useState, useEffect, useMemo } from "react";
import axios from "axios";

const useOrdersNuve = (
  {
    created_at_min,
    created_at_max,
    page = 1,
    per_page = 10,
    payment_status,
    shipping_status,
  } = {}
) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalOrders, setTotalOrders] = useState(0);

  // Memorizar las fechas por defecto
  const { finalCreatedAtMin, finalCreatedAtMax } = useMemo(() => {
    const today = new Date();
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(today.getDate() - 2);

    return {
      finalCreatedAtMin: created_at_min || twoDaysAgo.toISOString(),
      finalCreatedAtMax: created_at_max || today.toISOString(),
    };
  }, [created_at_min, created_at_max]);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get("/api/ordersnuve", {
          params: {
            created_at_min: finalCreatedAtMin,
            created_at_max: finalCreatedAtMax,
            page,
            per_page,
            payment_status,
            shipping_status,
          },
        });

        const { orders: fetchedOrders, total_orders } = response.data;

        setOrders(fetchedOrders);
        setTotalOrders(total_orders);

        // Actualizar hasMore en base a la información de total_orders
        setHasMore(page * per_page < total_orders);
      } catch (err) {
        console.log(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [
    finalCreatedAtMin,
    finalCreatedAtMax,
    page,
    per_page,
    payment_status,
    shipping_status,
  ]);

  return { orders, loading, error, hasMore, totalOrders };
};

export default useOrdersNuve;
