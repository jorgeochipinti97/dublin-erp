"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useOrdersDatabase } from "@/hooks/useOrdersDatabase";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RotateCw } from "lucide-react";

const Page = () => {
  const { ordersDatabase } = useOrdersDatabase();
  const { toast } = useToast();
  const [ordersToReturn, setOrdersToReturn] = useState([]);

  const handleScan = async (message) => {
    try {
      const parsedData = JSON.parse(message);
      const id = parsedData.id;

      const order = ordersDatabase.find(
        (o) => o.tiendanubeOrderId == id && o.status === "DESPACHADO"
      );

      if (!order) {
        toast({
          title: "Orden no válida",
          description: `La orden ${id} debe estar en estado DESPACHADO para ser devuelta`,
          variant: "destructive",
        });
        return;
      }

      const orderToReturnFound = ordersToReturn.some(
        (e) => e.tiendanubeOrderId == id
      );
      if (orderToReturnFound) {
        toast({ title: "Esa orden ya se encuentra en la lista." });
        return;
      }

      setOrdersToReturn((prev) => [...prev, order]);
      toast({ title: "Orden agregada con éxito." });
    } catch (error) {
      console.error("Error al procesar la orden:", error);
      toast({
        title: "Error",
        description: "No se pudo procesar la orden, intente de nuevo",
        variant: "destructive",
      });
    }
  };

  const handleReturnOrders = async () => {
    try {
      const promises = ordersToReturn.map((order) =>
        axios.post("/api/database/orders/returns", { orderId: order.tiendanubeOrderId })
      );

      await Promise.all(promises);
      toast({ title: "Ordenes devueltas con éxito" });
      setOrdersToReturn([]);
    } catch (error) {
      console.error("Error al devolver las órdenes:", error);
      toast({
        title: "Error",
        description: "No se pudieron devolver todas las órdenes, intente de nuevo",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-screen min-h-screen md:hidden">
      <div className="flex justify-center">
        <div className="w-10/12 flex ">
          <Scanner
            onScan={(result) => handleScan(result[0].rawValue)}
            scanDelay={2000}
            allowMultiple={true}
          />
        </div>
      </div>
      <div className="mt-10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nro de orden</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Tienda</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordersToReturn.map((o, index) => (
              <TableRow key={index}>
                <TableCell>{o.tiendanubeOrderId}</TableCell>
                <TableCell>{o.createdAt}</TableCell>
                <TableCell>{o.store}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {ordersToReturn.length > 0 && (
          <div className="flex justify-center mt-5">
            <Button onClick={handleReturnOrders}>
              <RotateCw className="h-5 w-5 mr-2" />
              Procesar Devoluciones
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
