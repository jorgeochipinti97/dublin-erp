"use client";
import { useState, useEffect } from "react";
import { getSession } from "next-auth/react";
import axios from "axios";

export default function OrdersByUser() {
  const [stores, setStores] = useState([]);
  const [ordersByStore, setOrdersByStore] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [selectedStore, setSelectedStore] = useState(null); // Para manejar paginación específica por tienda

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const session = await getSession();

        if (!session) {
          throw new Error("No autenticado");
        }

        // Obtener datos del usuario y sus tiendas asociadas
        const response = await axios.get(
          `/api/database/users/email/${session.user.email}`
        );
        const userData = response.data;
        setStores(userData.stores);

        // Obtener órdenes para la primera tienda por defecto
        if (userData.stores.length > 0) {
          const initialStoreId = userData.stores[0].tiendanubeStoreId;
          setSelectedStore(initialStoreId);
          fetchOrdersForStore(initialStoreId, page);
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const fetchOrdersForStore = async (storeId, page = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/database/orders/store/${storeId}`,
        {
          withCredentials: true, 

          params: { page, limit: 10 },
        }
      );
      setOrdersByStore((prev) => ({
        ...prev,
        [storeId]: response.data.orders,
      }));
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (storeId, newPage) => {
    setPage(newPage);
    fetchOrdersForStore(storeId, newPage);
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Órdenes por Usuario</h1>
      {stores.length > 0 ? (
        <div>
          {stores.map((store) => (
            <div key={store.tiendanubeStoreId} className="p-4 border-b">
              <h2>Tienda: {store.name}</h2>
              <p>ID de Tiendanube: {store.tiendanubeStoreId}</p>
              <h3>Órdenes:</h3>
              {ordersByStore[store.tiendanubeStoreId]?.length > 0 ? (
                <ul>
                  {ordersByStore[store.tiendanubeStoreId].map((order) => (
                    <li key={order._id}>
                      <p>Orden ID: {order.tiendanubeOrderId}</p>
                      <p>Estado: {order.status}</p>
                      <p>Cliente: {order.customer?.name}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No hay órdenes para esta tienda.</p>
              )}
              <div className="flex justify-between mt-4">
                <button
                  disabled={page === 1}
                  onClick={() =>
                    handlePageChange(store.tiendanubeStoreId, page - 1)
                  }
                >
                  Anterior
                </button>
                <span>Página {page}</span>
                <button
                  onClick={() =>
                    handlePageChange(store.tiendanubeStoreId, page + 1)
                  }
                >
                  Siguiente
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No hay tiendas asociadas</p>
      )}
    </div>
  );
}
