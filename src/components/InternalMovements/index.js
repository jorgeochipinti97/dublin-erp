"use client";
import React, { useState, useEffect } from "react";
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
import { useToast } from "../ui/use-toast";
import { Separator } from "../ui/separator";
import axios from "axios";
import { Scanner } from "@yudiel/react-qr-scanner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { MinusCircle, SendHorizonalIcon } from "lucide-react";
import { useDepotsDatabase } from "@/hooks/useDepots";
import { getProductNameBySku } from "@/lib/utils";
import useProducts from "@/hooks/useProducts";
import { getSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export const InternalMovements = () => {
  const [user, setUser] = useState();
  const [isSubmit, setIsSubmit] = useState(false);
  const { toast } = useToast();

  const selectedDepot = "675c2ff50dbee3651aa8af53";
  const [mode, setMode] = useState("");
  const [fromState, setFromState] = useState("");
  const [skuCounts, setSkuCounts] = useState({});
  const { push } = useRouter();

  const fetchSession = async () => {
    const session = await getSession();

    if (session) {
      setUser(session.user);
    } else {
      push("/login");
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const addSkuToCounts = async (scannedSku) => {
    try {
      const totalScanned = (skuCounts[scannedSku] || 0) + 1;

      // Actualiza el estado de manera correcta, copiando el estado previo y evitando la manipulación directa
      setSkuCounts((prev) => {
        const updatedSkuCounts = {
          ...prev,
          [scannedSku]: totalScanned,
        };

        return updatedSkuCounts;
      });

      // Mostramos el toast para informar al usuario que el SKU fue agregado
      toast({
        title: "Producto agregado con éxito",
        description: `SKU: ${scannedSku}`,
      });
    } catch (error) {
      console.error(
        "Error al verificar la disponibilidad del producto:",
        error
      );
      toast({
        title: "Error",
        description: `No se pudo verificar la disponibilidad del SKU: ${scannedSku}.`,
        variant: "destructive",
      });
    }
  };
  const handleScan = (result) => {
    const scannedSku = result[0]?.rawValue;

    addSkuToCounts(scannedSku);
  };

  const handleMovement = async () => {
    setIsSubmit(true);
    console.log("Iniciando el movimiento...");

    // Verificar si todos los datos necesarios están presentes
    if (!Object.keys(skuCounts).length || !mode || !fromState) {
      console.log("Faltan datos necesarios: ");
      console.log("skuCounts:", skuCounts);
      console.log("mode:", mode);
      console.log("fromState:", fromState);

      toast({
        title: "Faltan datos",
        description:
          "Por favor, selecciona un SKU, un estado de origen y un estado de destino.",
        variant: "destructive",
      });

      setIsSubmit(false);
      return;
    }

    // Verificar el stock para cada SKU en la base de datos
    const unavailableSkus = [];
    console.log("Iniciando verificación de stock...");

    for (const [sku, quantity] of Object.entries(skuCounts)) {
      console.log(`Verificando SKU: ${sku} con cantidad: ${quantity}`);
      try {
        const response = await axios.get(
          `/api/database/depots/product/${sku}`,
          {
            params: { fromState },
          }
        );

        console.log("Respuesta de la verificación:", response.data);
        if (response.status !== 200 || !response.data.available) {
          console.log(`El SKU ${sku} no tiene suficiente stock.`);
          unavailableSkus.push(sku);
        }
      } catch (error) {
        console.error(
          "Error al verificar el producto desde el endpoint:",
          error
        );
        unavailableSkus.push(sku);
      }
    }

    // Si hay productos con stock insuficiente, mostrar una alerta y detener el movimiento
    if (unavailableSkus.length > 0) {
      console.log(
        "Los siguientes SKUs no tienen suficiente stock:",
        unavailableSkus
      );

      toast({
        title: "Stock insuficiente",
        description: `Los siguientes SKUs no tienen suficiente stock en el estado de origen (${fromState}): ${unavailableSkus.join(
          ", "
        )}`,
        variant: "destructive",
      });

      setIsSubmit(false);
      return;
    }

    // Proceder con el movimiento si todos los productos tienen suficiente stock
    console.log(
      "Todos los SKUs tienen suficiente stock. Procediendo con el movimiento..."
    );

    try {
      const response = await axios.post("/api/internal-movements", {
        depotId: selectedDepot,
        products: Object.entries(skuCounts).map(([sku, quantity]) => ({
          sku,
          quantity,
        })),
        user: user.name,
        fromState,
        toState: mode,
      });

      console.log(
        "Respuesta del servidor al intentar mover los productos:",
        response.data
      );

      if (response.status === 201) {
        console.log("Movimiento realizado con éxito.");

        toast({
          title: "Movimiento realizado con éxito",
          description: `Se ha realizado el movimiento de los productos desde ${fromState} a ${mode}.`,
          variant: "success",
        });

        setSkuCounts({}); // Limpiar el conteo de SKUs después del movimiento
      }
    } catch (error) {
      console.error("Error durante el movimiento:", error);

      toast({
        title: "Error",
        description: error.response?.data?.error || "Error desconocido",
        variant: "destructive",
      });
    } finally {
      setIsSubmit(false);
      console.log("Finalización del movimiento.");
    }
  };

  useEffect(() => {
    console.log("SkuCounts actualizado:", skuCounts);
  }, [skuCounts]);

  const removeSku = (sku) => {
    // Crea una copia del estado actual y elimina el SKU específico
    setSkuCounts((prev) => {
      const updatedCounts = { ...prev };
      delete updatedCounts[sku];
      return updatedCounts;
    });
  };

  const handleQuantityChange = async (sku, newQuantity) => {
    // Obtener la nueva cantidad a establecer, garantizando que sea al menos 1
    const newCount = Math.max(0, parseInt(newQuantity, 10) || 0);

    // Actualiza el conteo del SKU con el nuevo valor
    setSkuCounts((prev) => ({
      ...prev,
      [sku]: newCount,
    }));
  };
  return (
    <div className="">
        <div className="w-12/12 md:w-6/12">
          <Scanner onScan={handleScan} scanDelay={5000} allowMultiple={true} />
        </div>
      <div className="w-10/12">

        <Separator className="my-5" />

        <Select onValueChange={(e) => setFromState(e)} value={fromState}>
          <SelectTrigger className="w-10/12">
            <SelectValue placeholder="Selecciona el estado de origen" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Estado de Origen</SelectLabel>
              <SelectItem value="qualityControl">Control de calidad</SelectItem>
              <SelectItem value="damaged">Fallas</SelectItem>
              <SelectItem value="shelf">Estantería</SelectItem>
              <SelectItem value="reserved">Reservado</SelectItem>
              <SelectItem value="dispatched">Despachado</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Separator className="my-5" />

        <Select onValueChange={(e) => setMode(e)} value={mode}>
          <SelectTrigger className="w-10/12">
            <SelectValue placeholder="Selecciona el estado de destino" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Estado de Destino</SelectLabel>
              <SelectItem value="qualityControl">Control de calidad</SelectItem>
              <SelectItem value="damaged">Fallas</SelectItem>
              <SelectItem value="shelf">Estantería</SelectItem>
              <SelectItem value="reserved">Reservado</SelectItem>
              <SelectItem value="dispatched">Despachado</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Separator className="my-5" />

        {Object.keys(skuCounts).length > 0 && (
          <Table className="w-12/12">
            <TableHeader>
              <TableRow>
                <TableHead className="">SKU</TableHead>
                <TableHead>Cantidad</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(skuCounts).map(([sku, count]) => (
                <TableRow key={sku}>
                  <TableCell className="">{sku}</TableCell>
                  <TableCell className="flex items-center">
                    <input
                      type="number"
                      value={count}
                      onChange={(e) =>
                        handleQuantityChange(sku, e.target.value)
                      }
                      className="w-16 border rounded p-1"
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
        )}

        <div className="flex justify-start my-5">
          <Button onClick={handleMovement} disabled={isSubmit}>
            <SendHorizonalIcon className="mr-2 h-5 w-5" />
            Mover Producto
          </Button>
        </div>
      </div>
    </div>
  );
};
