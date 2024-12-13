"use client";
import React, { useEffect, useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "../ui/button";
import { MinusCircle, SearchCheck, SendHorizonalIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useToast } from "../ui/use-toast";
import { Separator } from "../ui/separator";

import axios from "axios";
import { Input } from "../ui/input";
import { getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useStoreStore, useInitializeStore } from "@/hooks/useStore"; // Incluye el hook `useInitializeStore`

export const Movements = () => {
  const [user, setUser] = useState(null);
  const { push } = useRouter();
  const [isSubmit, setIsSubmit] = useState(false);
  const { toast } = useToast();
  const { selectedStore } = useStoreStore();
  const isInitialized = useInitializeStore(); // Aseguramos que `selectedStore` se inicializó
  const [productsToUpdate, setProductsToUpdate] = useState([]);
  const [skuCounts, setSkuCounts] = useState({});
  const [mode, setMode] = useState("quality_control");
  const warehouse = "675c2ff50dbee3651aa8af53";

  const [skuInput, setSkuInput] = useState("");

  useEffect(() => {
    const countOccurrences = (arr) => {
      return arr.reduce((acc, sku) => {
        acc[sku] = skuCounts[sku] ? skuCounts[sku] : (acc[sku] || 0) + 1;
        return acc;
      }, {});
    };

    setSkuCounts((prevSkuCounts) => countOccurrences(productsToUpdate));
  }, [productsToUpdate]);

useEffect(()=>{console.log('tienda',selectedStore)},[selectedStore])

  const fetchSession = async () => {
    const session = await getSession();

    if (session) {
      setUser(session.user);
    } else {
      push("/login");
    }
  };

  useEffect(() => {
    if (isInitialized) {
      fetchSession();
    }
  }, [isInitialized]);

  const handleInputChange = (sku, newValue) => {
    setSkuCounts((prevCounts) => ({
      ...prevCounts,
      [sku]: parseInt(newValue, 10),
    }));
  };

  const handleSaveToDatabase = async () => {
    if (!isInitialized) {
      toast({
        title: "Inicializando",
        description: "Por favor, espera a que la tienda se cargue.",
        variant: "warning",
      });
      return;
    }

    if (!selectedStore) {
      toast({
        title: "Tienda no seleccionada",
        description: "Por favor, selecciona una tienda antes de continuar.",
        variant: "destructive",
      });
      return;
    }

    const productsToSave = [];
    setIsSubmit(true);

    for (const [sku, count] of Object.entries(skuCounts)) {
      try {
        // Obtener el producto completo del endpoint actual
        const { data: product } = await axios.get(`/api/nuve/sku/${sku}`, {
          params: {
            storeId: selectedStore?.tiendanubeStoreId,
            accessToken: selectedStore?.accessToken,
          },
        });

        if (!product || !product.variants) {
          toast({
            title: "Producto no encontrado",
            description: `No se encontró el producto con SKU ${sku}. Asegúrate de que estás trabajando con la tienda correcta (${selectedStore?.name}).`,
            variant: "destructive",
          });
          continue;
        }

        // Buscar la variante correspondiente al SKU
        const variant = product.variants.find((v) => v.sku === sku);

        if (!variant) {
          toast({
            title: "Variante no encontrada",
            description: `No se encontró una variante para el SKU ${sku}.`,
            variant: "destructive",
          });
          continue;
        }

        // Agregar la variante a la lista de guardado
        productsToSave.push({
          idNuve: variant.id, // ID de la variante
          sku: variant.sku,
          quantity: count,
        });
      } catch (error) {
        console.error(`Error al procesar SKU: ${sku}`, error);

        const errorMessage =
          error.response?.status === 404
            ? `Parece que las credenciales de la tienda ${selectedStore?.name} no son válidas. Por favor, verifica la tienda seleccionada.`
            : error.response?.data?.message || "Por favor, intenta más tarde.";

        toast({
          title: "Hubo un problema",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }
    }

    if (productsToSave.length === 0) {
      toast({
        title: "No se encontraron productos",
        description:
          "No pudimos procesar ningún producto. Asegúrate de que todos los SKUs sean correctos y que estás usando la tienda correcta.",
        variant: "destructive",
      });
      return;
    }

    console.log(productsToSave);
    try {
      const { data: movement } = await axios.post("/api/database/movements", {
        depotId: warehouse,
        products: productsToSave,
        description: `Movimiento de productos al estado ${mode}`,
        state: mode,
        storeIds: [selectedStore?._id],
        user: user.name,
      });

      console.log(movement);

      toast({
        title: "¡Productos guardados!",
        description:
          "Los productos se han guardado exitosamente en el sistema.",
        variant: "success",
      });

      setProductsToUpdate([]);
    } catch (error) {
      toast({
        title: "Ocurrió un error",
        description:
          "Tuvimos un problema al guardar los productos. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmit(false);
    }
  };


  const removeSku = (sku) => {
    setSkuCounts((prev) => {
      const updatedCounts = { ...prev };
      delete updatedCounts[sku];
      return updatedCounts;
    });

    setProductsToUpdate((prev) =>
      prev.filter((productSku) => productSku !== sku)
    );
  };

  const handleManualInput = () => {
    if (skuInput.trim() !== "") {
      setProductsToUpdate((prev) => [...prev, skuInput.trim()]);
      toast({
        title: "Producto ingresado manualmente",
        description: `SKU ${skuInput.trim()} agregado.`,
      });
      setSkuInput("");
    } else {
      toast({
        title: "Error",
        description: "Por favor, ingrese un SKU válido.",
        variant: "destructive",
      });
    }
  };

  const handleScan = (result) => {
    if (result) {
      update(result[0].rawValue);
    }
  };

  const update = (result) => {
    setProductsToUpdate((prev) => [...prev, result]);
    toast({
      title: "Producto escaneado con éxito",
      description: "Podrá volver a escanear luego de 2 segundos",
    });
  };

  if (!isInitialized) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="mt-5">
      <div className="">
        <div className="my-6 md:w-6/12 ">
          <Scanner
            onScan={(result) => handleScan(result)}
            scanDelay={1000}
            allowMultiple={true}
          />
        </div>
        <Separator className="my-5" />
        <div className="w-full my-5">
          <Input
            placeholder="Ingrese el SKU manualmente"
            value={skuInput}
            onChange={(e) => setSkuInput(e.target.value)}
            className="mb-4"
          />
          <div className="w-fit">
            <Button
              variant="outline"
              onClick={handleManualInput}
              className="w-full border border-black"
            >
              <SearchCheck className="mr-2 h-5 w-5" />
              Ingresar manualmente
            </Button>
          </div>
        </div>
        <Separator className="my-5" />

        <Select onValueChange={(e) => setMode(e)} value={mode}>
          <SelectTrigger className="w-10/12">
            <SelectValue placeholder="Selecciona un estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Estados</SelectLabel>
              <SelectItem value="quality_control">
                Control de calidad
              </SelectItem>
              <SelectItem value="defects">Fallas</SelectItem>
              <SelectItem value="shelf">Estanteria</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <div className="flex justify-start my-5">
          <Button onClick={() => handleSaveToDatabase()} disabled={isSubmit}>
            <SendHorizonalIcon className="mr-2 h-5 w-5" />
            Ingresar productos
          </Button>
        </div>
        <Separator className="my-5" />

        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="">SKU</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(skuCounts).map(([sku, count]) => (
              <TableRow key={sku}>
                <TableCell className="text-xs">{sku}</TableCell>
                <TableCell className="flex items-center">
                  <input
                    type="number"
                    value={count}
                    onChange={(e) => handleInputChange(sku, e.target.value)}
                    className="w-16 border rounded p-1"
                    onWheel={(e) => e.target.blur()}
                    min="1"
                  />
                  <Button
                    className="ml-2"
                    size="icon"
                    onClick={() => removeSku(sku)}
                  >
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
