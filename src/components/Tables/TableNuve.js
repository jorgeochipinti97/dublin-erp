"use client";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BoxIcon, FileBox, RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { formatDate } from "@/lib/utils";
import { useToast } from "../ui/use-toast";

export const TableNuve = () => {
  const [search, setSearch] = useState("");
  const [searchedOrder, setSearchedOrder] = useState(null);

  const [searchLoading, setSearchLoading] = useState(false);
  const { toast } = useToast();
  const handleSearch = async () => {
    if (search.trim() === "") return;

    setSearchLoading(true);

    setSearchedOrder(null);

    try {
      const response = await axios.get(
        `/api/database/orders/tiendanubeId/${search.trim()}`
      );
      const order = response.data;

      if (!order || order.message === "Orden aún no procesada") {
        toast({
          variant: "destructive",
          title: "Orden no encontrada o aún no procesada",
        });
      } else {
        setSearchedOrder(order);
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error al buscar la orden" });
    } finally {
      setSearchLoading(false);
    }
  };

  const handleReset = () => {
    setSearch("");
    setSearchedOrder(null);
  };

  return (
    <div className="h-screen md:w-[40vw]">
      <h1 className="tracking-tighter font-bold text-xl md:text-3xl mb-5">
        Buscar Orden por ID
      </h1>

      {/* Campo de búsqueda por ID */}
      <div className="mb-4 flex-col md:flex-row  flex space-x-4">
        <input
          type="text"
          placeholder="Buscar por ID de la orden"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded-md"
        />
        <Button
          onClick={handleSearch}
          className="p-2 text-white my-2 rounded-md"
          disabled={searchLoading}
        >
          <Search className=" h-5 w-5" />
          {searchLoading ? "Buscando..." : "Buscar"}
        </Button>

        {/* Botón para Resetear Búsqueda */}
        <Button
          onClick={handleReset}
          className="p-2 bg-gray-200 my-2 text-black rounded-md hover:bg-gray-300"
        >
          <RotateCcw className="mr-2 h-5 w-5" />
          Resetear
        </Button>
      </div>

      {/* Mostrar Resultado de Búsqueda */}
      <div>
        {searchedOrder && (
          <div className="border rounded-lg p-4 space-y-2 bg-gray-100">
            <h2 className="font-semibold text-lg">
              Orden #{searchedOrder.tiendanubeOrderId}
            </h2>
            <p>
              <strong>Status:</strong> {searchedOrder.status}
            </p>
            <p>
              <strong>Gestionado por:</strong>{" "}
              {searchedOrder.managedBy || "N/A"}
            </p>
            <p>
              <strong>En deposito:</strong> {searchedOrder.store}
            </p>
            <p>
              <strong>Fecha de Creación:</strong>{" "}
              {formatDate(searchedOrder.createdAt)}
            </p>
            <p>
              <strong>Última Actualización:</strong>{" "}
              {formatDate(searchedOrder.updatedAt)}
            </p>
            <p>
              <strong>Tienda:</strong> {searchedOrder.store}
            </p>

            <div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-sky-600 hover:bg-sky-700 mt-2">
                    <BoxIcon className="mr-2 h-5" /> Ver productos
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      Productos de la orden #{searchedOrder.tiendanubeOrderId}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-2">
                    {searchedOrder.products.map((product) => (
                      <div
                        key={product._id}
                        className="flex justify-between border-b py-2"
                      >
                        <span>SKU: {product.sku}</span>
                        <span>Cantidad: {product.quantity}</span>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div>
              {searchedOrder.movements && searchedOrder.movements.length > 0 ? (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700 mt-2">
                      <FileBox className="h-5 w-5 mr-2" /> Movimientos
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        Movimientos de la orden #
                        {searchedOrder.tiendanubeOrderId}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2">
                      {searchedOrder.movements.map((movement) => (
                        <div
                          key={movement._id}
                          className="flex flex-col border-b py-2"
                        >
                          <span>
                            <strong>Tipo:</strong> {movement.type}
                          </span>
                          <span>
                            <strong>Usuario:</strong> {movement.user}
                          </span>
                          <span>
                            <strong>Desde:</strong> {movement.fromState}{" "}
                            <strong>Hacia:</strong> {movement.toState}
                          </span>
                          <span>
                            <strong>Fecha:</strong> {formatDate(movement.date)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              ) : (
                <p className="mt-2">Sin movimientos</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
