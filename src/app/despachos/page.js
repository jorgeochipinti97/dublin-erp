"use client";

import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SendHorizonalIcon, Search, RotateCcw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Scanner } from "@yudiel/react-qr-scanner";

import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useStoreStore } from "@/hooks/useStore";

const Page = () => {
  const { selectedStore } = useStoreStore();

  const { toast } = useToast();
  const [ordersToDispatch, setOrdersToDispatch] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [user, setUser] = useState();
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

  useEffect(() => {
    const uniqueOrders = ordersToDispatch.reduce((acc, current) => {
      const x = acc.find(
        (item) => item.tiendanubeOrderId === current.tiendanubeOrderId
      );
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, []);
    if (ordersToDispatch.length !== uniqueOrders.length) {
      setOrdersToDispatch(uniqueOrders);
    }
  }, [ordersToDispatch]);

  const getOrderById = async (id) => {
    if (!selectedStore) {
      toast({
        title: "No se ha seleccionado ninguna tienda",
        description: "Por favor selecciona una tienda para continuar",
        variant: "destructive",
      });
      return;
    }

    try {
      if (id) {
        // Primer solicitud al endpoint de la orden en Tiendanube, usando storeId y accessToken
        const response = await axios.get(`/api/ordernuve`, {
          params: {
            id,
            storeId: selectedStore.tiendanubeStoreId,
            accessToken: selectedStore.accessToken,
          },
        });

        if (response.status === 200 && response.data) {
          const orderFromApi = response.data.data;

          if (orderFromApi.payment_status !== "paid") {
            toast({
              title: "Pago no aprobado",
              description:
                "La orden no puede ser procesada porque el pago no ha sido aprobado.",
              variant: "destructive",
            });
            return;
          }

          if (orderFromApi.status === "DESPACHADA") {
            toast({
              title: "La orden ya ha sido despachada",
              variant: "destructive",
            });
            return;
          }

          // Segunda solicitud al endpoint en la base de datos, usando el ID
          const orderToAdd = await axios.get(
            `/api/database/orders/tiendanubeId/${id}`
          );

          if (orderToAdd.data.status === "DESPACHADO") {
            toast({
              title: "La orden ya fue despachada",
              variant: "destructive",
            });
            return;
          }

          if (orderToAdd.data.status !== "PICKING") {
            toast({
              title: "La orden no está lista para ser despachada",
              description:
                "La orden no puede ser procesada porque no se encuentra en PICKING.",
              variant: "destructive",
            });
            return;
          }

          // Si la orden es válida, agrégala a las órdenes para despachar
          if (orderToAdd)
            setOrdersToDispatch((prev) => [...prev, orderToAdd.data]);

          toast({ title: "Orden cargada con éxito" });
        } else {
          toast({
            title: "Orden no encontrada",
            description: "Revise por favor el ID proporcionado",
          });
        }
      }
    } catch (err) {
      toast({
        title: "Orden no encontrada",
        description: "Prueba con otro código por favor",
        variant: "destructive",
      });
    }
  };

  const updateOrdersToDispatch = async () => {
    console.log(ordersToDispatch);
    try {
      const promises = ordersToDispatch.map(async (order) => {
        const { data } = await axios.put(`/api/dispatch`, {
          orderId: order.tiendanubeOrderId,
          user: user.name,
          storeId: selectedStore.tiendanubeStoreId,
          accessToken: selectedStore.accessToken,
        });
        return data;
      });

      await Promise.all(promises);
      toast({ title: "Órdenes despachadas con éxito" });

      setOrdersToDispatch([]);
    } catch (error) {
      console.error("Error updating orders:", error);
      toast({
        title: "Error despachando órdenes",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getOrderByScannerToDispatch = async (message) => {
    // let parsedData;
    // try {
    //   parsedData = JSON.parse(message);
    // } catch (error) {
    //   toast({
    //     title: "Código inválido",
    //     description: "El código escaneado no es válido.",
    //     variant: "destructive",
    //   });
    //   return;
    // }

    const id = message;
    if (!id) {
      toast({
        title: "Código inválido",
        description: "El código escaneado no contiene un ID válido.",
        variant: "destructive",
      });
      return;
    }

    try {
      const orderToAdd = await axios.get(
        `/api/database/orders/tiendanubeId/${id}`
      );

      if (orderToAdd.data.status == "DESPACHADO") {
        toast({
          title: "La orden ya fue despachada",
          variant: "destructive",
        });
        return;
      }
      if (orderToAdd.data.status !== "PICKING") {
        toast({
          title: "La orden no está lista para ser despachada",
          description:
            "La orden no puede ser procesada porque no se encuentra en PICKING.",
          variant: "destructive",
        });
        return;
      }

      // Revisar si la orden ya está en el array
      const orderToDispatchFound = ordersToDispatch.some(
        (e) => e.tiendanubeOrderId === id
      );
      if (orderToDispatchFound) {
        toast({ title: "Esa orden ya se encuentra en la lista." });
        return;
      }

      // Agregar la nueva orden al array sin eliminar las anteriores
      setOrdersToDispatch((prev) => [...prev, orderToAdd.data]);
      toast({ title: "Orden agregada con éxito." });
    } catch (error) {
      console.error("Error al obtener la orden:", error);
      toast({
        title: "Orden no encontrada",
        description: "Prueba con otro código por favor",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex justify-center">
      <div className=" w-10/12 md:w-5/12">
        <div className="flex justify-center">
          <div className="justify-center md:w-6/12 w-10/12 mt-10 flex">
            <Scanner
              onScan={(result) =>
                getOrderByScannerToDispatch(result[0].rawValue)
              }
              scanDelay={1500}
              allowMultiple={true}
            />
          </div>
        </div>
        <Separator className="my-5" />
        <div className="">
          <Input
            className=""
            placeHolder="Buscar por ID"
            onChange={(e) => setSearchId(e.target.value)}
          />
          <div className="flex justify-around mt-5">
            <Button onClick={() => getOrderById(searchId)}>
              <Search className="h-5 w-5 mr-2" />
              Buscar
            </Button>
            <Button
              onClick={() => setOrdersToDispatch([])}
              variant="outline"
              className="border border-black"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Resetear
            </Button>
          </div>
        </div>
        <Separator className="my-5" />

        <div className="flex justify-center mt-5">
          <Button onClick={updateOrdersToDispatch}>
            <SendHorizonalIcon className="mr-2 h-5 w-5" />
            Despachar Todas
          </Button>
        </div>
        <div className="mt-10">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nro de orden</TableHead>
                <TableHead className="">Fecha</TableHead>
                <TableHead>Tienda</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordersToDispatch.map((order, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <p className="font-medium">{order.tiendanubeOrderId}</p>
                  </TableCell>
                  <TableCell className="tracking-tighter text-xs">
                    {formatDate(order.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Badge className="text-xs" variant="outline">
                      {order.store}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Page;
