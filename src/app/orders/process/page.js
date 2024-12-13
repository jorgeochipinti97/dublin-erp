"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PackageCheck,
  PackageSearch,
  PackageX,
  RotateCcw,
  Search,
} from "lucide-react";
import axios from "axios";

import { useDepotsDatabase } from "@/hooks/useDepots";
import { getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useInitializeStore, useStoreStore } from "@/hooks/useStore";

const Page = () => {
  const [user, setUser] = useState();
  const [isSubmit, setIsSubmit] = useState(false);
  const { toast } = useToast();
  const [searchId, setSearchId] = useState("");
  const { selectedStore } = useStoreStore();
  const isInitialized = useInitializeStore();

  const [products, setProducts] = useState([]);
  const [order, setOrder] = useState(null);
  const [skuProducts, setSkuProducts] = useState([]);
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
    if (order) {
      setSkuProducts([]);
      setProducts(order.products);
    }
  }, [order]);

  const areAllProductsChecked = () => {
    return products.every((product) => {
      const scannedCount = skuProducts.filter(
        (identifier) =>
          identifier === product.sku || identifier === product.product_id
      ).length;

      return scannedCount === Number(product.quantity); // Validar cantidad escaneada vs requerida
    });
  };

  const validateStockInDepot = async (
    sku,
    requiredQuantity,
    fromState = "shelf"
  ) => {
    const depotId = "675c2ff50dbee3651aa8af53"; // ID fijo del depósito

    try {
      const response = await axios.get(`/api/database/depots/product/${sku}`, {
        params: {
          fromState,
          requiredQuantity,
        },
      });

      const data = response.data;

      if (!data.available) {
        toast({
          title: "Stock insuficiente",
          description: `No hay suficiente stock de ${sku} en estantería. Disponible: No disponible, Requerido: ${requiredQuantity}`,
          variant: "destructive",
        });
        return false;
      }

      return true;
    } catch (error) {
      if (error.response) {
        // El servidor respondió con un estado fuera del rango 2xx
        if (error.response.status === 404) {
          toast({
            title: "Depósito no encontrado",
            description: `No se encontró el depósito con ID: ${depotId}`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error de servidor",
            description: "Ocurrió un error al verificar el stock.",
            variant: "destructive",
          });
        }
      } else if (error.request) {
        // La solicitud fue hecha pero no se recibió respuesta
        toast({
          title: "Error de conexión",
          description:
            "No se pudo conectar al servidor para verificar el stock.",
          variant: "destructive",
        });
      } else {
        // Algo sucedió al configurar la solicitud que desencadenó un error
        console.error(
          "Error al validar el stock en el depósito:",
          error.message
        );
        toast({
          title: "Error inesperado",
          description: "Ocurrió un error inesperado.",
          variant: "destructive",
        });
      }
      return false;
    }
  };

  const handleSkuProducts = (sku) => {
    setSkuProducts((prev) => [...prev, sku]);
  };

  useEffect(() => {
    if (skuProducts.length === 0) return;

    const checkStock = async () => {
      const identifier = skuProducts[skuProducts.length - 1]; // Último SKU o idNuve
      const product = products.find(
        (p) => p.sku == identifier || p.product_id == identifier
      );

      if (!product) {
        toast({ title: "Identificador no válido", variant: "destructive" });
        setSkuProducts((prev) => prev.slice(0, -1));
        return;
      }

      const count = skuProducts.filter((p) => p === identifier).length;
      const quantityAllowed = Number(product.quantity);

      if (count > quantityAllowed) {
        toast({
          title: "Cantidad máxima alcanzada para este SKU",
          description: `No puedes agregar más de ${quantityAllowed} unidades para el SKU ${identifier}.`,
          variant: "destructive",
        });

        setSkuProducts((prev) => prev.slice(0, -1));
        return;
      }

      // const isValidStock = await validateStockInDepot(identifier, count);

      // if (!isValidStock) {
      //   setSkuProducts((prev) => prev.slice(0, -1));
      //   return;
      // }

      toast({
        title: "Producto agregado con éxito",
        description: `${identifier} agregado.`,
      });
    };

    checkStock();
  }, [skuProducts, products, setSkuProducts]);

  const getOrderById = useCallback(
    async (id) => {
      // Validación inicial: Verificar si hay una tienda seleccionada
      if (!selectedStore) {
        toast({
          title: "Seleccione una tienda para continuar",
          variant: "destructive",
        });
        return;
      }

      // Validación inicial: Verificar si ya hay una orden cargada
      if (order !== null) {
        toast({
          title: "Operación no permitida",
          description:
            "Debes terminar o cambiar la orden actual antes de continuar.",
          variant: "destructive",
        });
        return;
      }

      // Validación inicial: Verificar si se proporcionó un ID válido
      if (!id || typeof id !== "string") {
        toast({
          title: "ID inválido",
          description: "El ID de la orden es obligatorio y debe ser válido.",
          variant: "destructive",
        });
        return;
      }

      try {
        // Paso 1: Verificar si la orden ya ha sido procesada en la base de datos
        const dbResponse = await axios.get(
          `/api/database/orders/tiendanubeId/${id}`
        );
        if (dbResponse.status === 200 && dbResponse.data) {
          if (dbResponse.data.message !== "Orden aún no procesada") {
            toast({
              title: "Orden procesada",
              description:
                "Esta orden ya ha sido procesada y no puede ser modificada.",
              variant: "destructive",
            });
            return;
          }
        }

        // Paso 2: Obtener la orden desde la API de Tiendanube
        const apiResponse = await axios.get(`/api/ordernuve?id=${id}`, {
          params: {
            storeId: selectedStore.tiendanubeStoreId,
            accessToken: selectedStore.accessToken,
          },
        });

        if (apiResponse.status === 200 && apiResponse.data) {
          const orderFromApi = apiResponse.data.data;

          // Validación: Verificar si el pago está aprobado
          if (orderFromApi.payment_status !== "paid") {
            toast({
              title: "Pago no aprobado",
              description:
                "La orden no puede ser procesada porque el pago no ha sido aprobado.",
              variant: "destructive",
            });
            return;
          }

          // Validación: Verificar si la orden ya está en estado PICKING
          if (orderFromApi.status === "PICKING") {
            toast({
              title: "Orden en estado PICKING",
              description: "Esta orden ya está siendo procesada.",
              variant: "destructive",
            });
            return;
          }

          // Validación: Verificar si la orden ya ha sido despachada
          if (orderFromApi.status === "DESPACHADA") {
            toast({
              title: "Orden despachada",
              description: "Esta orden ya ha sido enviada.",
              variant: "destructive",
            });
            return;
          }

          // Asignar la orden y notificar al usuario
          setOrder(orderFromApi);
          toast({ title: "Orden cargada con éxito" });
        }
      } catch (error) {
        // Manejo de errores
        if (error.response) {
          // Error específico de la respuesta
          console.error("Error en la API:", error.response.data);
          toast({
            title: "Error en la API",
            description:
              error.response.data.message ||
              "Ocurrió un error al cargar la orden.",
            variant: "destructive",
          });
        } else if (error.request) {
          // Error en la solicitud (sin respuesta)
          console.error("Error en la solicitud:", error.request);
          toast({
            title: "Error de red",
            description:
              "No se recibió respuesta del servidor. Intenta nuevamente.",
            variant: "destructive",
          });
        } else {
          // Error desconocido
          console.error("Error desconocido:", error.message);
          toast({
            title: "Error inesperado",
            description: "Ocurrió un error inesperado. Intenta nuevamente.",
            variant: "destructive",
          });
        }
      }
    },
    [selectedStore, order, toast, setOrder] // Dependencias
  );

  const getOrder = async (message) => {
    let parsedData;

    try {
      parsedData = JSON.parse(message);
    } catch (error) {
      toast({
        title: "Código QR inválido",
        description: "El código escaneado no contiene una orden válida.",
        variant: "destructive",
      });
      return;
    }

    const id = message;

    if (order != null) {
      toast({
        title: "Debes terminar o cambiar la orden actual",
        variant: "destructive",
      });
      return;
    }

    try {
      if (id) {
        // Verificar en la base de datos si ya ha sido procesada
        const dbResponse = await axios.get(
          `/api/database/orders/tiendanubeId/${id}`
        );

        if (dbResponse.status === 200 && dbResponse.data) {
          if (dbResponse.data.message === "Orden aún no procesada") {
            // Proceder a buscar en Tiendanube si la orden aún no ha sido procesada
          } else {
            toast({
              title: "Esta orden ya ha sido procesada",
              description: "No es posible procesar una orden ya registrada.",
              variant: "destructive",
            });
            return;
          }
        }

        // Si no está en la base de datos, buscar en Tiendanube
        const response = await axios.get(`/api/ordernuve?id=${id}`, {
          params: {
            storeId: selectedStore?.tiendanubeStoreId,
            accessToken: selectedStore?.accessToken,
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

          if (orderFromApi.status === "PICKING") {
            toast({
              title: "La orden ya está en estado PICKING",
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

          setOrder(orderFromApi);
          toast({ title: "Orden cargada con éxito" });
        }
      }
    } catch (err) {
      console.error("Error en getOrder:", err);
      toast({
        title: "Algo salió mal",
        description: "Revisa la tienda",
        variant: "destructive",
      });
    }
  };

  const hanldeReset = () => {
    setProducts([]);
    setOrder(null);
    setIsSubmit(false);
  };
  const handleProcessOrder = async () => {
    if (!order || skuProducts.length === 0) {
      toast({
        title: "No hay productos para procesar",
        description: "Escanea los productos antes de procesar la orden.",
        variant: "destructive",
      });
      return;
    }
    if (!areAllProductsChecked()) {
      toast({
        title: "No todos los productos están comprobados",
        description:
          "Por favor, asegúrate de que todos los productos estén escaneados correctamente.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmit(true);
    try {
      const response = await axios.post("/api/picking", {
        orderId: order.id,
        storeId: order.store_id,
        status: "PICKING",
        user: user.name,
        products: order.products.map((product) => ({
          sku: product.sku,
          quantity: skuProducts.filter((sku) => sku === product.sku).length,
          idNuve: product.idNuve,
        })),
      });

      if (response.status === 200 || response.status === 201) {
        toast({
          title: "Orden procesada con éxito",
          description:
            "La orden ha sido actualizada y los productos reservados.",
          variant: "default",
        });

        setOrder(null);
        setSkuProducts([]);
      } else {
        toast({
          title: "Algo salió mal",
          description: response.data.error || "No se pudo procesar la orden.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error en la solicitud",
        description: error.response?.data?.error || "Error desconocido",
        variant: "destructive",
      });
    } finally {
      hanldeReset();
    }
  };

  const handleScan = (result) => {
    if (result) {
      handleSkuProducts(result); // Llama a la función que maneja la lógica del SKU
    }
  };
  useEffect(() => {
    if (isInitialized && !selectedStore) {
      toast({ title: "Seleccione una tienda para continuar" });
    }
  }, [isInitialized, selectedStore, toast]);

  if (!isInitialized) {
    return <div>Loading...</div>; // Mostrar estado de carga
  }

  if (!selectedStore) {
    return <div>No hay tienda seleccionada.</div>; // Mostrar mensaje si no hay tienda seleccionada
  }

  return (
    <div className="flex justify-center">
      <div className="w-10/12 flex mt-10 justify-center">
        <div className="mb-10">
          <div className="flex justify-start">
            <div className="flex justify-center mt-10 w-auto md:w-6/12">
              {order && (
                <Scanner
                  onScan={(result) => handleScan(result[0].rawValue)}
                  scanDelay={1000}
                  allowMultiple={true}
                />
              )}
              {!order && (
                <Scanner
                  onScan={(result) => getOrder(result[0].rawValue)}
                  scanDelay={1000}
                  allowMultiple={false}
                />
              )}
            </div>
          </div>

          <div className="flex flex-col ml-5 mt-5">
            <Input
              className="w-[60vw] md:w-10/12"
              placeHolder="Buscar por ID"
              onChange={(e) => setSearchId(e.target.value)}
            />
          </div>
          <div className="flex justify-around  mt-5">
            <Button onClick={() => getOrderById(searchId)} className="mr-5">
              <Search className="h-5 w-5 mr-2" />
              Buscar
            </Button>
            <Button
              onClick={hanldeReset}
              variant="outline"
              className="border border-black"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Resetear
            </Button>
          </div>
          <Separator className="my-5" />
          <div className="flex justify-center">
            <Button
              disabled={
                skuProducts.length === 0 ||
                !order ||
                !areAllProductsChecked() ||
                isSubmit // Agrega la validación de isSubmit
              }
              onClick={handleProcessOrder}
              size="lg"
            >
              <PackageSearch className="h-6 w-6 mr-2" /> Procesar
            </Button>
          </div>

          {/* AGREGAR ERROR SKY OARA PRODUCTOS QUE NO SE LES ENCEUNTRA EL NOMBRE */}

          {order && (
            <div className="flex justify-center mt-5 ">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell className="text-xs">Nombre</TableCell>
                    <TableCell className="hidden text-xs md:table-cell">
                      SKU
                    </TableCell>
                    <TableCell className="text-xs">Cantidad Total</TableCell>
                    <TableCell className="text-xs">
                      Cantidad Escaneada
                    </TableCell>
                    <TableCell className="text-xs">Estado</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.sku}>
                      <TableCell className="text-xs">{product.name}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {product.sku}
                      </TableCell>
                      <TableCell>{product.quantity}</TableCell>
                      <TableCell>
                        {
                          skuProducts.filter(
                            (identifier) =>
                              identifier == product.sku ||
                              identifier == product.product_id
                          ).length
                        }
                      </TableCell>
                      <TableCell>
                        {Number(product.quantity) ===
                        skuProducts.filter(
                          (identifier) =>
                            identifier == product.sku ||
                            identifier == product.product_id
                        ).length ? (
                          <PackageCheck className="text-green-800" />
                        ) : (
                          <PackageX className="text-red-500" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
