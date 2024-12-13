"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { useOrdersDatabase } from "@/hooks/useOrdersDatabase";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import axios from "axios";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export const TableOrders = () => {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [maxPage, setMaxPage] = useState(1);
  const itemsPerPage = 10; // Cambia el límite por página según sea necesario
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleExport = async () => {
    if (!startDate || !endDate) {
      alert("Por favor, selecciona una fecha de inicio y fin para exportar.");
      return;
    }

    try {
      const response = await axios.get("/api/database/orders/export", {
        params: { startDate, endDate },
        responseType: "blob", // Importante para recibir el archivo como blob
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Orders_${startDate}_to_${endDate}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error al exportar las órdenes a Excel:", error);
      alert("Hubo un error al intentar exportar las órdenes.");
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get("/api/database/orders", {
        params: { page: currentPage, limit: itemsPerPage },
      });

      if (response) {
        setOrders(response.data.orders);
        setMaxPage(response.data.totalPages); // Configurar el número total de páginas desde la respuesta
      }
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage]);

  const handleNext = () => {
    if (currentPage < maxPage) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <div>
      <div className="mb-4 flex items-center space-x-4">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border px-2 py-1 rounded"
          placeholder="Fecha de inicio"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border px-2 py-1 rounded"
          placeholder="Fecha de fin"
        />
        <Button onClick={handleExport}>Exportar a Excel</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="hidden md:table-cell">ID</TableHead>
            <TableHead className="">Fecha</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Tienda</TableHead>
            <TableHead>Movimientos</TableHead> {/* Nueva columna */}
          </TableRow>
        </TableHeader>
        <TableBody className="">
          {orders &&
            orders?.map((order, index) => (
              <TableRow key={index}>
                <TableCell className="hidden md:table-cell">
                  <p className="font-medium">{order.tiendanubeOrderId}</p>
                </TableCell>
                <TableCell className="tracking-tighter text-xs">
                  {formatDate(order.createdAt)}
                </TableCell>
                <TableCell>
                  <p className="font-medium">{order.status}</p>
                </TableCell>

                <TableCell>
                  <Badge className="text-xs" variant="outline">
                    Chunas
                  </Badge>
                </TableCell>

                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>Ver Movimientos</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          Movimientos de la Orden {order.tiendanubeOrderId}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        {order.movements.length > 0 ? (
                          order.movements.map((movement, index) => (
                            <div key={index} className="border-b pb-2">
                              <p>
                                <strong>Movimiento:</strong> {movement.type}
                              </p>
                              <p>
                                <strong>Fecha:</strong>{" "}
                                {formatDate(movement.date)}
                              </p>
                              <p>
                                <strong>De:</strong> {movement.fromState}{" "}
                                <strong>A:</strong> {movement.toState}
                              </p>
                              <p>
                                <strong>Usuario:</strong> {movement.user}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p>No hay movimientos asociados a esta orden.</p>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={handlePrev}
              disabled={currentPage === 1}
            />
          </PaginationItem>
          <PaginationItem>
            <span>
              Página {currentPage} de {maxPage}
            </span>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              onClick={handleNext}
              disabled={currentPage === maxPage}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};
