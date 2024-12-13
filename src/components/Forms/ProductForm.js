"use client";

import { useForm, useFieldArray } from "react-hook-form";
import axios from "axios";
import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";

export default function ProductForm() {
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);

  const { register, handleSubmit, setValue, control, reset } = useForm({
    defaultValues: {
      selectedVariants: [],
      individualProduct: {
        name: "",
        sku: "",
        stock: { shelf: 0, qualityControl: 0, damaged: 0, reserved: 0 },
      },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "selectedVariants",
  });

  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Obtener las tiendas al cargar
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await axios.get("/api/database/stores");
        setStores(response.data);
      } catch (error) {
        console.error("Error al obtener tiendas:", error);
      }
    };
    fetchStores();
  }, []);

  // Obtener los productos cuando se selecciona una tienda
  const fetchProducts = async (storeId, accessToken) => {
    try {
      const response = await axios.get(`/api/productsnuve`, {
        params: { storeId, accessToken, page: 1, per_page: 50 },
      });
      setProducts(response.data.products);
    } catch (error) {
      console.error("Error al obtener productos:", error);
      toast({
        title: "Error",
        description:
          "No se pudieron obtener los productos de la tienda seleccionada.",
        variant: "destructive",
      });
    }
  };

  const handleStoreChange = (e) => {
    const storeId = e.target.value;
    const store = stores.find((store) => store._id === storeId);
    setSelectedStore(store);
    setProducts([]);
    reset({ selectedVariants: [], individualProduct: {} }); // Reiniciar selección al cambiar de tienda
    if (store) {
      fetchProducts(store.tiendanubeStoreId, store.accessToken);
    }
  };

  const handleVariantSelection = (e, product, variant) => {
    const isChecked = e.target.checked;
    const variantData = {
      productId: product.id,
      variantId: variant.id,
    };

    if (isChecked) {
      append(variantData);
    } else {
      const index = fields.findIndex(
        (item) => item.productId === product.id && item.variantId === variant.id
      );
      if (index !== -1) remove(index);
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      // Crear un producto individual asociado a los IDs seleccionados
      const payload = {
        individualProduct: data.individualProduct,
        associatedVariants: data.selectedVariants,
      };

      const response = await axios.post("/api/database/products", payload);

      toast({
        title: "Producto individual creado exitosamente",
        description: response.data.message,
      });
      reset();
    } catch (error) {
      toast({
        title: "Error al guardar el producto individual",
        description: error.response?.data?.message || "Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Seleccionar Tienda */}
      <div>
        <Label htmlFor="store">Seleccionar Tienda</Label>
        <select
          id="store"
          onChange={handleStoreChange}
          className="w-full p-2 border rounded"
        >
          <option value="">Seleccione una tienda</option>
          {stores.map((store) => (
            <option key={store._id} value={store._id}>
              {store.name} - {store.tiendanubeStoreId}
            </option>
          ))}
        </select>
      </div>

      {/* Seleccionar Productos y Variantes */}
      {selectedStore && products.length > 0 && (
        <div>
          <Label>Seleccionar Variantes</Label>
          <div className="border p-4 rounded">
            {products.map((product) => (
              <div key={product.id} className="mb-4">
                <div className="font-bold mb-2">{product.name.es}</div>
                {product.variants.map((variant) => (
                  <div key={variant.id} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id={`variant-${variant.id}`}
                      value={variant.id}
                      onChange={(e) =>
                        handleVariantSelection(e, product, variant)
                      }
                      className="mr-2"
                    />
                    <label
                      htmlFor={`variant-${variant.id}`}
                      className="text-sm"
                    >
                      {product.name.es || "Sin nombre"}{" "}
                      {variant.values.map((e) => `${e.es} `)}
                    </label>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detalles del Producto Individual */}
      <div>
        <Label>Detalles del Producto Individual</Label>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Nombre</Label>
            <Input
              {...register("individualProduct.name", {
                required: "El nombre es obligatorio",
              })}
              placeholder="Nombre del producto individual"
            />
          </div>
          <div>
            <Label>SKU</Label>
            <Input
              {...register("individualProduct.sku", {
                required: "El SKU es obligatorio",
              })}
              placeholder="SKU del producto individual"
            />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div>
            <Label>Shelf</Label>
            <Input
              {...register("individualProduct.stock.shelf", {
                valueAsNumber: true,
              })}
              placeholder="Stock Shelf"
            />
          </div>
          <div>
            <Label>Quality Control</Label>
            <Input
              {...register("individualProduct.stock.qualityControl", {
                valueAsNumber: true,
              })}
              placeholder="Stock Quality Control"
            />
          </div>
          <div>
            <Label>Damaged</Label>
            <Input
              {...register("individualProduct.stock.damaged", {
                valueAsNumber: true,
              })}
              placeholder="Stock Damaged"
            />
          </div>
          <div>
            <Label>Reserved</Label>
            <Input
              {...register("individualProduct.stock.reserved", {
                valueAsNumber: true,
              })}
              placeholder="Stock Reserved"
            />
          </div>
        </div>
      </div>

      {/* Variantes Seleccionadas */}
      {fields.length > 0 && (
        <div>
          <Label>Variantes Seleccionadas</Label>
          <div className="border p-4 rounded">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="flex justify-between items-center mb-2"
              >
                <span>
                  Producto ID: {field.productId}, Variante ID: {field.variantId}
                </span>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => remove(index)}
                  className="ml-2"
                >
                  Quitar
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botón de Enviar */}
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Guardando..." : "Crear Producto Individual"}
      </Button>
    </form>
  );
}
