"use client";
import { ChevronLeft, ChevronRight, Copy, Download, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { Separator } from "@/components/ui/separator";
import React, { useEffect, useState } from "react";

import Cookies from "js-cookie";

export const OrderDetails = ({order}) => {
  // const [order, setOrder] = useState(null);

  // useEffect(() => {
  //   const orderDetails = JSON.parse(Cookies.get('orderDetails'));
  //   setOrder(orderDetails);
  // }, []);

  if (!order) {
    return (
      <div className="p-28 flex items-center justify-center">
        <span className="loader"></span>
      </div>
    );
  }

  return (

    <Card className="" x-chunk="dashboard-05-chunk-4">
      <CardHeader className="flex flex-row items-start bg-muted/50">
        <div className="grid gap-0.5">
          <CardTitle className="group flex items-center gap-2 text-lg">
            Order {order.order_id}
            <Button
              size="icon"
              variant="outline"
              className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Copy className="h-3 w-3" />
              <span className="sr-only">Copy Order ID</span>
            </Button>
          </CardTitle>
          <CardDescription>
            fecha: {new Date(order.created_at).toLocaleDateString()}
          </CardDescription>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1"
            onClick={() => window.open(order.tracking_url, "_blank")}
          >
            <Truck className="h-3.5 w-3.5" />
            <span className="lg:sr-only xl:not-sr-only xl:whitespace-nowrap">
              Seguimiento de Orden
            </span>
          </Button>
          <Button size="icon" variant="outline" className="h-8 w-8">
            <Download className="h-3.5 w-3.5" />
            <span className="sr-only">Más</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 text-sm">
        <div className="grid gap-3">
          <div className="font-semibold">Detalles de la Orden</div>
          <ul className="grid gap-3">
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">Order ID</span>
              <span>{order.order_id}</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">Store ID</span>
              <span>{order.store_id}</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">Estado</span>
              <span>{order.status}</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">Estado del Envío</span>
              <span>{order.shipping_status}</span>
            </li>
          </ul>
          <Separator className="my-2" />
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-3">
              <div className="font-semibold">Información de Envío</div>
              <address className="grid gap-0.5 not-italic text-muted-foreground">
                <span>{order.contact_name}</span>
                <span>
                  {order.address}, {order.city}, {order.province},{" "}
                  {order.country}
                </span>
                <span>{order.zipcode}</span>
                <span>{order.contact_phone}</span>
              </address>
            </div>
            <div className="grid auto-rows-max gap-3">
              <div className="font-semibold">Información de Facturación</div>
              <div className="text-muted-foreground">
                <span>{order.customer_name}</span>
                <span>{order.customer_email}</span>
                <span>{order.customer_phone}</span>
                <span>{order.customer_identification}</span>
              </div>
            </div>
          </div>
        </div>
        <Separator className="my-4" />
        <div className="grid gap-3">
          <div className="font-semibold">Información del Cliente</div>
          <dl className="grid gap-3">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Nombre</dt>
              <dd>{order.customer_name}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Email</dt>
              <dd>
                <a href={`mailto:${order.customer_email}`}>
                  {order.customer_email}
                </a>
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Teléfono</dt>
              <dd>
                <a href={`tel:${order.customer_phone}`}>
                  {order.customer_phone}
                </a>
              </dd>
            </div>
          </dl>
        </div>
      </CardContent>
      <CardFooter className="flex flex-row items-center border-t bg-muted/50 px-6 py-3">
        <div className="text-xs text-muted-foreground">
          Actualizado{" "}
          <time dateTime={order.updated_at}>
            {new Date(order.updated_at).toLocaleDateString()}
          </time>
        </div>
        <Pagination className="ml-auto mr-0 w-auto">
          <PaginationContent>
            <PaginationItem>
              <Button size="icon" variant="outline" className="h-6 w-6">
                <ChevronLeft className="h-3.5 w-3.5" />
                <span className="sr-only">Orden Anterior</span>
              </Button>
            </PaginationItem>
            <PaginationItem>
              <Button size="icon" variant="outline" className="h-6 w-6">
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="sr-only">Siguiente Orden</span>
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </CardFooter>
    </Card>

    //   <Card className="overflow-hidden" x-chunk="dashboard-05-chunk-4">
    //   <CardHeader className="flex flex-row items-start bg-muted/50">
    //     <div className="grid gap-0.5">
    //       <CardTitle className="group flex items-center gap-2 text-lg">
    //         Order {order.orderId}
    //         <Button
    //           size="icon"
    //           variant="outline"
    //           className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
    //         >
    //           <Copy className="h-3 w-3" />
    //           <span className="sr-only">Copy Order ID</span>
    //         </Button>
    //       </CardTitle>
    //       <CardDescription>
    //         Fecha: {order.date}
    //       </CardDescription>
    //     </div>
    //     <div className="ml-auto flex items-center gap-1">
    //       <Button
    //         size="sm"
    //         variant="outline"
    //         className="h-8 gap-1"
    //         onClick={() =>
    //           push(
    //             "https://apis.urbano.com.ar/cespecifica/?shi_codigo=003575&cli_codigo=%20101923"
    //           )
    //         }
    //       >
    //         <Truck className="h-3.5 w-3.5" />
    //         <span className="lg:sr-only xl:not-sr-only xl:whitespace-nowrap">
    //           Seguimiento de Orden
    //         </span>
    //       </Button>

    //           <Button
    //             size="icon"
    //             variant="outline"
    //             className="h-8 w-8"
    //           >
    //             <Download className="h-3.5 w-3.5" />
    //             <span className="sr-only">Más</span>
    //           </Button>

    //     </div>
    //   </CardHeader>
    //   <CardContent className="p-6 text-sm">
    //     <div className="grid gap-3">
    //       <div className="font-semibold">Detalles de la Orden</div>
    //       <ul className="grid gap-3">
    //         {order.items.map((item, index) => (
    //           <li
    //             key={index}
    //             className="flex items-center justify-between"
    //           >
    //             <span className="text-muted-foreground">
    //               {item.name} x <span>{item.quantity}</span>
    //             </span>
    //             <span>${item.price}</span>
    //           </li>
    //         ))}
    //       </ul>
    //       <Separator className="my-2" />
    //       <ul className="grid gap-3">
    //         <li className="flex items-center justify-between">
    //           <span className="text-muted-foreground">Subtotal</span>
    //           <span>${order.subtotal}</span>
    //         </li>
    //         <li className="flex items-center justify-between">
    //           <span className="text-muted-foreground">Envío</span>
    //           <span>${order.shipping}</span>
    //         </li>
    //         <li className="flex items-center justify-between">
    //           <span className="text-muted-foreground">Impuesto</span>
    //           <span>${order.tax}</span>
    //         </li>
    //         <li className="flex items-center justify-between font-semibold">
    //           <span className="text-muted-foreground">Total</span>
    //           <span>${order.total}</span>
    //         </li>
    //       </ul>
    //     </div>
    //     <Separator className="my-4" />
    //     <div className="grid grid-cols-2 gap-4">
    //       <div className="grid gap-3">
    //         <div className="font-semibold">Información de Envío</div>
    //         <address className="grid gap-0.5 not-italic text-muted-foreground">
    //           <span>{order.shippingInfo.name}</span>
    //           <span>{order.shippingInfo.address}</span>
    //         </address>
    //       </div>
    //       <div className="grid auto-rows-max gap-3">
    //         <div className="font-semibold">
    //           Información de Facturación
    //         </div>
    //         <div className="text-muted-foreground">
    //           {order.billingInfo}
    //         </div>
    //       </div>
    //     </div>
    //     <Separator className="my-4" />
    //     <div className="grid gap-3">
    //       <div className="font-semibold">Información del Cliente</div>
    //       <dl className="grid gap-3">
    //         <div className="flex items-center justify-between">
    //           <dt className="text-muted-foreground">Cliente</dt>
    //           <dd>{order.customerInfo.name}</dd>
    //         </div>
    //         <div className="flex items-center justify-between">
    //           <dt className="text-muted-foreground">Email</dt>
    //           <dd>
    //             <a href={`mailto:${order.customerInfo.email}`}>
    //               {order.customerInfo.email}
    //             </a>
    //           </dd>
    //         </div>
    //         <div className="flex items-center justify-between">
    //           <dt className="text-muted-foreground">Teléfono</dt>
    //           <dd>
    //             <a href={`tel:${order.customerInfo.phone}`}>
    //               {order.customerInfo.phone}
    //             </a>
    //           </dd>
    //         </div>
    //       </dl>
    //     </div>
    //   </CardContent>
    //   <CardFooter className="flex flex-row items-center border-t bg-muted/50 px-6 py-3">
    //     <div className="text-xs text-muted-foreground">
    //       Actualizado{" "}
    //       <time dateTime="2023-11-23">{order.date}</time>
    //     </div>
    //     <Pagination className="ml-auto mr-0 w-auto">
    //       <PaginationContent>
    //         <PaginationItem>
    //           <Button
    //             size="icon"
    //             variant="outline"
    //             className="h-6 w-6"
    //           >
    //             <ChevronLeft className="h-3.5 w-3.5" />
    //             <span className="sr-only">Orden Anterior</span>
    //           </Button>
    //         </PaginationItem>
    //         <PaginationItem>
    //           <Button
    //             size="icon"
    //             variant="outline"
    //             className="h-6 w-6"
    //           >
    //             <ChevronRight className="h-3.5 w-3.5" />
    //             <span className="sr-only">Siguiente Orden</span>
    //           </Button>
    //         </PaginationItem>
    //       </PaginationContent>
    //     </Pagination>
    //   </CardFooter>
    // </Card>
  );
};
