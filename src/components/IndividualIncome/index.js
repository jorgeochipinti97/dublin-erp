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

export const IndividualIncome = () => {
  const [user, setUser] = useState(null);
  const { push } = useRouter();
  const [isSubmit, setIsSubmit] = useState(false);
  const { toast } = useToast();
  const [productsToUpdate, setProductsToUpdate] = useState([]);
  const [skuCounts, setSkuCounts] = useState({});
  const [mode, setMode] = useState("quality_control");

  const [skuInput, setSkuInput] = useState("");

  useEffect(() => {
    const fetchSession = async () => {
      const session = await getSession();

      if (session) {
        setUser(session.user);
      } else {
        push("/login");
      }
    };

    fetchSession();
  }, []);

  const handleInputChange = (sku, newValue) => {
    setSkuCounts((prevCounts) => ({
      ...prevCounts,
      [sku]: parseInt(newValue, 10),
    }));
  };

  const handleSaveToDatabase = async () => {
    if (!productsToUpdate.length) {
      toast({
        title: "No hay productos para guardar",
        description: "Por favor, agrega productos antes de continuar.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmit(true);
    const productsToSave = [];

    for (const [sku, count] of Object.entries(skuCounts)) {
      try {
        const { data: product } = await axios.get(
          `/api/database/products/id/${sku}`
        );
        if (!product) {
          toast({
            title: "Producto no encontrado",
            description: `No se encontró el producto con SKU ${sku}.`,
            variant: "destructive",
          });
          continue;
        }

        productsToSave.push({
          productId: product._id,
          quantity: count,
        });
      } catch (error) {
        console.error(`Error al procesar SKU: ${sku}`, error);
        toast({
          title: "Error al buscar producto",
          description: `No se pudo obtener información del producto con SKU ${sku}.`,
          variant: "destructive",
        });
        return;
      }
    }

    try {
      await axios.post("/api/database/movements/individual", {
        products: productsToSave,
        description: `Movimiento al estado ${mode}`,
        state: mode,
        user: user?.name,
      });

      toast({
        title: "Movimiento registrado",
        description: "Los productos se han registrado correctamente.",
        variant: "success",
      });

      setProductsToUpdate([]);
      setSkuCounts({});
    } catch (error) {
      console.error("Error al guardar los productos:", error);
      toast({
        title: "Error al guardar",
        description:
          "No se pudieron guardar los productos. Intenta nuevamente.",
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
      setSkuCounts((prev) => ({
        ...prev,
        [skuInput.trim()]: (prev[skuInput.trim()] || 0) + 1,
      }));
      toast({
        title: "Producto agregado",
        description: `SKU ${skuInput.trim()} agregado manualmente.`,
        variant: "success",
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
      const scannedSku = result[0].rawValue.trim();
      setProductsToUpdate((prev) => [...prev, scannedSku]);
      setSkuCounts((prev) => ({
        ...prev,
        [scannedSku]: (prev[scannedSku] || 0) + 1,
      }));
      toast({
        title: "Producto escaneado",
        description: `SKU ${scannedSku} agregado.`,
        variant: "success",
      });
    }
  };

  return (
    <div className="mt-5">
      <div className="my-6 md:w-6/12">
        <Scanner onScan={handleScan} scanDelay={1000} allowMultiple={true} />
      </div>
      <Separator className="my-5" />
      <Input
        placeholder="Ingrese el SKU manualmente"
        value={skuInput}
        onChange={(e) => setSkuInput(e.target.value)}
        className="mb-4"
      />
      <Button onClick={handleManualInput} variant="outline">
        <SearchCheck className="mr-2 h-5 w-5" />
        Ingresar manualmente
      </Button>
      <Separator className="my-5" />
      <Select onValueChange={setMode} value={mode}>
        <SelectTrigger className="w-10/12">
          <SelectValue placeholder="Selecciona un estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Estados</SelectLabel>
            <SelectItem value="quality_control">Control de calidad</SelectItem>
            <SelectItem value="defects">Fallas</SelectItem>
            <SelectItem value="shelf">Estantería</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <Separator className="my-5" />
      <Button onClick={handleSaveToDatabase} disabled={isSubmit}>
        <SendHorizonalIcon className="mr-2 h-5 w-5" />
        Registrar movimiento
      </Button>
      <Separator className="my-5" />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>SKU</TableHead>
            <TableHead>Cantidad</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(skuCounts).map(([sku, count]) => (
            <TableRow key={sku}>
              <TableCell>{sku}</TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={count}
                  onChange={(e) => handleInputChange(sku, e.target.value)}
                />
              </TableCell>
              <TableCell>
                <Button size="icon" onClick={() => removeSku(sku)}>
                  <MinusCircle className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
