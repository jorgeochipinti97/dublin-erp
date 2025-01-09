"use client";

import { Button } from "@/components/ui/button";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";

const StoresPage = () => {
  const { data: session } = useSession(); // Obtener la sesión
  const [tiendaId, setTiendaId] = useState("");
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [stores, setStores] = useState([]); // Lista de tiendas
  const { toast } = useToast();
  // Obtener tiendas al cargar la página
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await fetch("/api/database/stores");
        if (!response.ok) {
          throw new Error("Error al obtener las tiendas");
        }
        const data = await response.json();
        setStores(data);
      } catch (error) {
        toast({ title: `Error: ${error.message}`, variant: "destructive" });
      }
    };

    fetchStores();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newStore = {
      tiendanubeStoreId: tiendaId,
      name,
      domain,
      accessToken,
      owner: session?.user?.id, // ID del cliente obtenido de la sesión
    };

    try {
      // Crear la tienda
      const createStoreResponse = await fetch("/api/database/stores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newStore),
      });

      if (!createStoreResponse.ok) {
        const errorData = await createStoreResponse.json();
        console.log(errorData);
      }

      const createdStore = await createStoreResponse.json();

      // Actualizar la lista de tiendas
      setStores((prevStores) => [...prevStores, createdStore]);

      toast({ title: "Tienda creada con éxito" });
      setTiendaId("");
      setName("");
      setDomain("");
      setAccessToken("");
    } catch (error) {
      toast({ title: `Error: ${error.message}` });
    }
  };

  const handleDisassociate = async (storeId) => {
    try {
      const response = await fetch(`/api/database/stores?id=${storeId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Error desconocido al desasociar la tienda"
        );
      }

      // Actualizar la lista de tiendas después de eliminar
      setStores((prevStores) =>
        prevStores.filter((store) => store._id !== storeId)
      );
      toast({ title: "Tienda desasociada con éxito" });
    } catch (error) {
      toast({ title: `Error: ${error.message}` });
    }
  };



  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Gestionar Tiendas</h1>

      {/* Formulario para crear tiendas */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-full max-w-md mb-8"
      >
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">ID de Tienda</label>
          <input
            type="number"
            value={tiendaId}
            onChange={(e) => setTiendaId(e.target.value)}
            className="border rounded w-full px-3 py-2"
            placeholder="ID de Tienda en Tiendanube"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Nombre</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded w-full px-3 py-2"
            placeholder="Nombre de la tienda"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Dominio</label>
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="border rounded w-full px-3 py-2"
            placeholder="Dominio de la tienda (opcional)"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Access Token</label>
          <input
            type="text"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            className="border rounded w-full px-3 py-2"
            placeholder="Access Token de la API de Tiendanube"
            required
          />
        </div>
        <Button type="submit" className="">
          Crear Tienda
        </Button>
      </form>

      {/* Tabla de tiendas */}
      <h2 className="text-xl font-bold mb-4">Lista de Tiendas</h2>
      <div className="bg-white rounded shadow-md w-full max-w-4xl p-4">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="border-b px-4 py-2">Nombre</th>
              <th className="border-b px-4 py-2">Dominio</th>
              <th className="border-b px-4 py-2">ID Tiendanube</th>
              <th className="border-b px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {stores.map((store) => (
              <tr key={store._id}>
                <td className="border-b px-4 py-2">{store.name}</td>
                <td className="border-b px-4 py-2">
                  {store.domain || "No definido"}
                </td>
                <td className="border-b px-4 py-2">
                  {store.tiendanubeStoreId}
                </td>
                <td className="border-b px-4 py-2">
                  <Button
                    onClick={() => handleDisassociate(store._id)}
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    Desasociar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StoresPage;
