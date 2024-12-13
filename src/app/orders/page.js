"use client";

import Link from "next/link";
import {
  Copy,
  Download,
  File,
  ListFilter,
  ScanSearch,
  Truck,
} from "lucide-react";

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
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

import React, { useEffect, useState } from "react";
import { TableOrders } from "@/components/Tables/TableOrders";

import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useSupabaseData } from "@/hooks/useSupabaseData";

const Page = () => {
  const [orderDetails, setOrderDetails] = useState();
  const { ordersSupabase, } = useSupabaseData();



  const getOrder = async (orders) => {
    try {
      const promises = orders.map(async (order) => {
        const response = await axios.get(`/api/ordernuve?id=${order.order_id}`);
        return response.data;
      });

      const results = await Promise.all(promises);
      setOrderDetails(results);
      console.log(results);
    } catch (error) {
      console.error("Error fetching order data:", error);
    }
  };

  useEffect(() => {
    if (ordersSupabase && ordersSupabase.length > 0) {
      getOrder(ordersSupabase);
    }
  }, [ordersSupabase]);

  return (
    <div>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
            <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                <Card className="sm:col-span-2" x-chunk="dashboard-05-chunk-0">
                  <CardHeader className="pb-3">
                    <CardTitle>Gestión de Órdenes</CardTitle>
                    <CardDescription className="max-w-lg text-balance leading-relaxed">
                      Accede a la sección de procesamiento y validación de
                      órdenes, y emparejamiento con productos.
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Link href="/orders/process">
                      <Button>
                        <ScanSearch className="h-3.5 w-3.5 mr-2" />
                        Ir a Procesar Órdenes
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>

                <Card x-chunk="dashboard-05-chunk-1">
                  <CardHeader className="pb-2">
                    <CardDescription>Esta Semana</CardDescription>
                    <CardTitle className="text-2xl">35 Ordenes</CardTitle>{" "}
                    {/* Reemplazar con valor dinámico */}
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground">
                      +25% desde la semana pasada
                    </div>
                  </CardContent>
                  <CardFooter></CardFooter>
                </Card>

                <Card x-chunk="dashboard-05-chunk-2">
                  <CardHeader className="pb-2">
                    <CardDescription>Este Mes</CardDescription>
                    <CardTitle className="text-2xl">120 Ordenes</CardTitle>{" "}
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground">
                      +10% desde el mes pasado
                    </div>
                  </CardContent>
                  <CardFooter></CardFooter>
                </Card>
              </div>
              <div>
                <div className=" my-4">
                  <div className="ml-auto flex items-center gap-2">
                    <Input
                      type="search"
                      placeholder="Buscar por id"
                      className=" w-12/12 border-black border"
                    />
                    <Button className="ml-2" size="sm">
                      Enviar
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1" />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 gap-1 text-sm"
                      >
                        <ListFilter className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only">Filter</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuCheckboxItem checked>
                        Packing
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem>
                        Picking
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem>
                        Refunded
                      </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
  
                </div>

                <Card x-chunk="dashboard-05-chunk-3">
                  <CardContent>
                    <TableOrders
                      setOrderDetails={setOrderDetails}
                      orderDetails={orderDetails}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
            <div className="max-w-10/12">
              {orderDetails ? (
                <Card >
                  <CardHeader className="flex flex-row items-start bg-muted/50">
                    <div className="grid gap-0.5">
                      <CardTitle className="group flex items-center gap-2 text-lg">
                        Order {orderDetails.order_id}
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
                        fecha:{" "}
                        {new Date(orderDetails.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="ml-auto flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1"
                        onClick={() =>
                          window.open(orderDetails.tracking_url, "_blank")
                        }
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
                    {orderDetails.shipping_address ? (
                      <>
                        <div className="grid gap-3">
                          <div className="font-semibold">
                            Detalles de la Orden
                          </div>
                          <ul className="grid gap-3">
                            <li className="flex items-center justify-between">
                              <span className="text-muted-foreground">
                                Order ID
                              </span>
                              <span>{orderDetails.id}</span>
                            </li>
                            <li className="flex items-center justify-between">
                              <span className="text-muted-foreground">
                                Store ID
                              </span>
                              <span>{orderDetails.store_id}</span>
                            </li>
                            <li className="flex items-center justify-between">
                              <span className="text-muted-foreground">
                                Estado
                              </span>
                              <span>{orderDetails.status}</span>
                            </li>
                          </ul>
                          <Separator className="my-2" />
                          <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-3">
                              <div className="font-semibold">
                                Información de Envío
                              </div>
                              <address className="grid gap-0.5 not-italic text-muted-foreground">
                                <span>{orderDetails.contact_name}</span>
                                <span>
                                  {orderDetails.shipping_address.address},{" "}
                                  {orderDetails.shipping_address.city},{" "}
                                  {orderDetails.province},{" "}
                                  {orderDetails.shipping_address.country}
                                </span>
                                <span>{orderDetails.zipcode}</span>
                                <span>{orderDetails.contact_phone}</span>
                              </address>
                            </div>
                            <div className="grid auto-rows-max gap-3">
                              <div className="font-semibold">
                                Información de Facturación
                              </div>
                              <div className="text-muted-foreground flex flex-col">
                                <span>{orderDetails.billing_name}</span>
                                <span>
                                  {orderDetails.shipping_address.email}
                                </span>
                                <span>{orderDetails.billing_phone}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <Separator className="my-4" />
                        <div className="grid gap-3">
                          <div className="font-semibold">
                            Información del Cliente
                          </div>
                          <dl className="grid gap-3">
                            <div className="flex items-center justify-between">
                              <dt className="text-muted-foreground">Nombre</dt>
                              <dd>{orderDetails.shipping_address.address}</dd>
                            </div>
                            <div className="flex items-center justify-between">
                              <dt className="text-muted-foreground">Email</dt>
                              <dd>
                                <a
                                  href={`mailto:${orderDetails.shipping_address.email}`}
                                >
                                  {orderDetails.contact_email}
                                </a>
                              </dd>
                            </div>
                            <div className="flex items-center justify-between">
                              <dt className="text-muted-foreground">
                                Teléfono
                              </dt>
                              <dd>
                                <a
                                  href={`tel:${orderDetails.shipping_address.phone}`}
                                >
                                  {orderDetails.shipping_address.phone}
                                </a>
                              </dd>
                            </div>
                          </dl>
                        </div>
                        <Separator className="my-4" />

                        <Table className="w-10/12">
                          <TableHeader>
                            <TableRow>
                   
                              <TableHead className="text-center">SKU</TableHead>
                              <TableHead className="text-center">
                                Cantidad
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {orderDetails.products.map((product) => (
                              <TableRow key={product.id}>
               
                                <TableCell className="">
                                  {product.sku}
                                </TableCell>
                                <TableCell className=" text-center">
                                  {product.quantity}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </>
                    ) : (
                      <p>Información de envío no disponible</p>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="p-28 flex items-center justify-center">
                  <span className="loader"></span>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Page;
