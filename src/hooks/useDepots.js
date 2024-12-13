import { useState, useEffect } from "react";
import axios from "axios";

export const useDepotsDatabase = () => {
  const [depotsDatabase, setDepotsDatabase] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get("/api/database/depots");
        setDepotsDatabase(response.data);
      } catch (err) {
        console.log(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return { depotsDatabase, loading, error };
};


