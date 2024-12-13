"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axios from "axios";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "../ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import * as XLSX from "xlsx"; // Importar XLSX para exportar a Excel
import { getProductNameBySku } from "@/lib/utils";

export const TableDepots = () => {
  const [depotsDatabase, setDepotsDatabase] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [variants, setVariants] = useState([]); // Estado para almacenar las variantes
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [maxPage, setMaxPage] = useState(1);
  const [productNames, setProductNames] = useState({});


  const exportToExcel = async () => {
    try {
      const params = {};

      if (selectedGroup !== "all") params.group = selectedGroup;

      // Llamada al endpoint de exportación para obtener los últimos 300 registros filtrados
      const response = await axios.get(`/api/database/depots/export`, {
        params,
      });
      const exportProducts = response.data.products;

      console.log("Productos exportados:", exportProducts); // Verifica si contiene datos

      if (exportProducts.length === 0) {
        console.warn("No hay datos para exportar con los filtros actuales.");
        return; // Detiene la exportación si no hay datos
      }

      const exportData = exportProducts.map((product) => ({
        SKU: product.sku,
        Estanteria: product.shelf,
        Fallas: product.damaged,
        "Control de Calidad": product.qualityControl,
        Reservados: product.reserved,
        Despachados: product.dispatched,
        "Depósito de Fallas": product.damagedDepot,
        Proveedor: product.provider || "N/A",
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Depósitos");

      XLSX.writeFile(workbook, `Depo-${new Date()}.xlsx`);
    } catch (error) {
      console.error("Error al exportar a Excel:", error);
    }
  };

  const fetchDepots = async (page = 1) => {
    try {
      const response = await axios.get(
        `/api/database/depots?page=${page}&itemsPerPage=${itemsPerPage}`
      );
      setDepotsDatabase(response.data.depots);
      setMaxPage(response.data.totalPages);
      response.data.depots
        .flatMap((depot) => depot.currentStock)
        .forEach((stockItem) => fetchProductName(stockItem.sku));
    } catch (error) {
      console.error("Error al obtener los datos de los depósitos:", error);
    }
  };

  useEffect(() => {
    fetchDepots(currentPage);
  }, [currentPage]);

  // Fetch de las variantes
  useEffect(() => {
    const fetchVariants = async () => {
      try {
        const response = await axios.get(`/api/database/depots/variants`);
        setVariants(response.data.variants);
      } catch (error) {
        console.error("Error al obtener las variantes:", error);
      }
    };

    fetchVariants();
  }, []);

  // Fetch para el filtro global por variante (cuando se selecciona un grupo específico)
  useEffect(() => {
    if (selectedGroup === "all") {
      setCurrentPage(1); // Reiniciar a la primera página
      fetchDepots(1);
    } else {
      const fetchFilteredProducts = async () => {
        try {
          const response = await axios.get(
            `/api/database/depots/search?searchQuery=${selectedGroup}`
          );
          setDepotsDatabase([{ currentStock: response.data.products }]);
          setMaxPage(1); // Sin paginación en filtro global
        } catch (error) {
          console.error("Error al buscar productos globalmente:", error);
        }
      };

      fetchFilteredProducts();
    }
  }, [selectedGroup]);

  const handleGroupChange = (value) => {
    setSelectedGroup(value);
  };

  const handleNext = () => {
    if (currentPage < maxPage) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  // Restablece el estado de la paginación a la vista original
  const handleReset = () => {
    setSelectedGroup("all");
    setCurrentPage(1);
    fetchDepots(1); // Llamada para volver a cargar la paginación inicial
  };

  return (
    <div>
      <div className="my-5 flex space-x-4">
        <Select onValueChange={handleGroupChange}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Filtrar por grupo de variantes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los productos</SelectItem>
            {variants.map((variant) => (
              <SelectItem key={variant} value={variant}>
                {variant}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedGroup !== "all" && (
          <Button onClick={handleReset}>Mostrar todos</Button>
        )}
      </div>
      <div className="flex justify-start ml-5">
        <Button onClick={exportToExcel} className="mb-4">
          Exportar a Excel
        </Button>
      </div>
      <Table className='min-h-screen'>
        <TableCaption>
          Una tabla detallada sobre el stock de tu depósito.
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>SKU</TableHead>
            <TableHead>Estanteria</TableHead>
            <TableHead>Fallas</TableHead>
            <TableHead>Control de Calidad</TableHead>
            <TableHead>Reservados</TableHead>
            <TableHead>Despachados</TableHead>
            <TableHead>Deposito de fallas</TableHead>
            <TableHead>Proveedor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {depotsDatabase
            .flatMap((depot) => depot.currentStock)
            .map((stockItem) => (
              <TableRow key={stockItem.sku}>
                <TableCell>
                  {" "}
                  {stockItem.sku}
                </TableCell>
                <TableCell>
                  {stockItem.shelf > 0 ? (
                    <Badge>{stockItem.shelf}</Badge>
                  ) : (
                    stockItem.shelf
                  )}
                </TableCell>
                <TableCell>
                  {stockItem.damaged > 0 ? (
                    <Badge>{stockItem.damaged}</Badge>
                  ) : (
                    stockItem.damaged
                  )}
                </TableCell>
                <TableCell>
                  {stockItem.qualityControl > 0 ? (
                    <Badge>{stockItem.qualityControl}</Badge>
                  ) : (
                    stockItem.qualityControl
                  )}
                </TableCell>
                <TableCell>
                  {stockItem.reserved > 0 ? (
                    <Badge>{stockItem.reserved}</Badge>
                  ) : (
                    stockItem.reserved
                  )}
                </TableCell>
                <TableCell>
                  {stockItem.dispatched > 0 ? (
                    <Badge>{stockItem.dispatched}</Badge>
                  ) : (
                    stockItem.dispatched
                  )}
                </TableCell>
                <TableCell>
                  {stockItem.damagedDepot > 0 ? (
                    <Badge>{stockItem.damagedDepot}</Badge>
                  ) : (
                    stockItem.damagedDepot
                  )}
                </TableCell>
                <TableCell>{stockItem.provider}</TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      {/* Navegación de paginación */}
      {selectedGroup === "all" && (
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
      )}
    </div>
  );
};
