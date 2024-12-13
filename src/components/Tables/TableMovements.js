"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import * as XLSX from "xlsx"; // Importar XLSX para exportar a Excel

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import axios from "axios";
import { debounce } from "lodash"; // Usar lodash para debounce
import { Button } from "../ui/button";
import { getProductNameBySku } from "@/lib/utils";
import { Separator } from "../ui/separator";

export const TableMovements = () => {
  const [variants, setVariants] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedUser, setSelectedUser] = useState("all");
  const [selectedMovementType, setSelectedMovementType] = useState("all");
  const [selectedSku, setSelectedSku] = useState("all");
  const [movements, setMovements] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMovements, setLoadingMovements] = useState(false);
  const [productNames, setProductNames] = useState({}); // Almacena nombres por SKU

  useEffect(()=>{console.log(movements)},[movements])
  const translateMovementType = (type) =>
    {
    const translations = {
      reserve: "Reservado",
      dispatched: "Despachado",
      qualityControl: "Control de Calidad",
      shelf: "Estantería",
      damaged: "Dañado",
      damagedDepot: "Depósito de fallas",
      provider: "Proveedor",
    };
    return translations[type] || type;
  };

  const translateState = (state) => {
    const translations = {
      reserve: "Reservado",
      dispatched: "Despachado",
      qualityControl: "Control de Calidad",
      shelf: "Estantería",
      damaged: "Dañado",
      damagedDepot: "Depósito de fallas",
      provider: "Proveedor",
    };
    return translations[state] || state;
  };

  const fetchProductName = async (sku) => {
    if (!productNames[sku]) {
      const name = await getProductNameBySku(sku);
      setProductNames((prev) => ({ ...prev, [sku]: name }));
    }
  };
  const extractVariants = async () => {
    try {
      const response = await axios.get("/api/nuve/variants");
      if (response.data.variants) {
        setVariants(response.data.variants);
      }
    } catch (error) {
      console.log("Error fetching variants:", error);
    }
  };

  useEffect(() => {
    extractVariants();
  }, []);

  // Fetch de movimientos con paginación y filtros
  const fetchFilteredMovements = async (page = 1) => {
    setLoadingMovements(true);
    try {
      const params = {
        page,
        limit: 30, // Limite de resultados por página
      };

      if (selectedSku !== "all") params.sku = selectedSku;
      if (selectedUser !== "all") params.user = selectedUser;
      if (selectedMovementType !== "all")
        params.movementType = selectedMovementType;
      if (selectedDate) params.date = selectedDate;
      if (selectedTime) params.time = selectedTime;

      const response = await axios.get(`/api/database/movements/search`, {
        params,
      });

      const { movements, totalPages } = response.data;

      movements.forEach((movement) => {
        movement.products.forEach((product) => fetchProductName(product.sku));
      });

      setMovements(movements);
      setTotalPages(totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching movements:", error);
    } finally {
      setLoadingMovements(false);
    }
  };

  // Función debounced para evitar múltiples llamadas simultáneas
  const debouncedFetchFilteredMovements = debounce(fetchFilteredMovements, 500);

  // Cargar movimientos al montar el componente
  useEffect(() => {
    debouncedFetchFilteredMovements(1); // Iniciar con la primera página
    return () => {
      debouncedFetchFilteredMovements.cancel(); // Cancelar el debounce cuando se desmonte
    };
  }, [
    selectedSku,
    selectedUser,
    selectedMovementType,
    selectedDate,
    selectedTime,
  ]);

  // Manejar la navegación de la paginación
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      fetchFilteredMovements(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      fetchFilteredMovements(currentPage - 1);
    }
  };

  const exportToExcel = async () => {
    try {
      const params = {};

      if (selectedSku !== "all") params.sku = selectedSku;
      if (selectedUser !== "all") params.user = selectedUser;
      if (selectedMovementType !== "all")
        params.movementType = selectedMovementType;
      if (selectedDate) params.date = selectedDate;
      if (selectedTime) params.time = selectedTime;

      // Solicitar los últimos 300 movimientos con filtros aplicados
      const response = await axios.get("/api/database/movements/export", {
        params,
      });
      const exportMovements = response.data.movements;

      // Transformar los datos a formato adecuado para Excel
      const exportData = exportMovements.map((movement) => ({
        Fecha: new Date(movement.date).toLocaleString("es-ES", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        SKU: movement.products.map((product) => product.sku).join(", "),
        Cantidad: movement.products
          .map((product) => product.quantity)
          .join(", "),
        Tipo: translateMovementType(movement.type),
        Movimiento:
          movement.fromState && movement.toState
            ? `${translateState(movement.fromState)} -> ${translateState(
                movement.toState
              )}`
            : "N/A",
        Usuario: movement.user || "N/A",
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Movimientos");

      XLSX.writeFile(workbook, "Movimientos.xlsx");
    } catch (error) {
      console.error("Error al exportar a Excel:", error);
    }
  };

  if (loadingMovements)
    return (
      <div className="h-[40vh] w-full flex items-center justify-center">
        <span className="loader" />
      </div>
    );

  return (
    <div className="py-10">
      <div className="flex justify-around">
        {/* Filtro por SKU */}
        <Select
          onValueChange={(value) => {
            setSelectedSku(value);
          }}
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue
              placeholder={
                selectedSku === "all"
                  ? "Filtrar por variantes"
                  : variants.find((variant) => variant.sku === selectedSku)
                      ?.productName || selectedSku
              }
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los productos</SelectItem>
            {variants.map((variant, index) => (
              <SelectItem key={index} value={variant.sku}>
                {variant.productName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filtro por usuario */}
        <Select
          onValueChange={(value) => {
            setSelectedUser(value);
          }}
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue
              placeholder={
                selectedUser === "all" ? "Filtrar por usuario" : selectedUser
              }
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los usuarios</SelectItem>
            <SelectItem value="Celular 1">Celular 1</SelectItem>
            <SelectItem value="Celular 2">Celular 2</SelectItem>
            <SelectItem value="Celular 3">Celular 3</SelectItem>
            <SelectItem value="Celular 4">Celular 4</SelectItem>
          </SelectContent>
        </Select>

        {/* Filtro por tipo de movimiento */}
        <Select
          onValueChange={(value) => {
            setSelectedMovementType(value);
          }}
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue
              placeholder={
                selectedMovementType === "all"
                  ? "Filtrar por tipo de movimiento"
                  : selectedMovementType
              }
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="reserve">Reservado</SelectItem>
            <SelectItem value="dispatched">Despachado</SelectItem>
            <SelectItem value="qualityControl">Control de Calidad</SelectItem>
          </SelectContent>
        </Select>

        {/* Filtro por fecha y hora */}
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="input"
        />
        <input
          type="time"
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
          className="input"
        />
      </div>
      <div className="flex justify-start my-4">
        <Button onClick={exportToExcel} className="btn btn-primary">
          Exportar a Excel
        </Button>
      </div>
      {/* Tabla de resultados */}
      <Table className="mt-10">
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Cantidad</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Movimiento</TableHead>
            <TableHead>Usuario</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {movements.map((movement) => (
            <TableRow key={movement._id}>
              <TableCell>
                {new Date(movement.date).toLocaleString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </TableCell>

              <TableCell>
                {movement.products.map((product) => (
                  <span key={product.sku}>
                    { product.sku ? product.sku : product.idNuve} <br />
                    <Separator className='my-2'/>
                  </span>
                ))}
              </TableCell>

              <TableCell>
                {movement.products.map((product) => (
                  <span key={product.sku}>
                    <span>{product.quantity}</span>
                    <br />
                    <Separator className='my-2'/>
                  </span>
                ))}
              </TableCell>

              <TableCell>{translateMovementType(movement.type)}</TableCell>

              <TableCell>
                {movement.fromState && movement.toState ? (
                  <span>{`${translateState(
                    movement.fromState
                  )} -> ${translateState(movement.toState)}`}</span>
                ) : (
                  "N/A"
                )}
              </TableCell>

              <TableCell>{movement.user || "N/A"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Paginación */}
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious onClick={handlePreviousPage} />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink isActive={currentPage}>
              {currentPage}
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext onClick={handleNextPage} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};
