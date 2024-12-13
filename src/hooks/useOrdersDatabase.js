import { useState, useEffect } from "react";
import axios from "axios";

export const useOrdersDatabase = () => {
  const [ordersDatabase, setOrdersDatabase] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get("/api/database/orders");
        setOrdersDatabase(response.data);


      } catch (err) {
        console.log(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return { ordersDatabase, loading, error };
};


