"use client";
import React, { useEffect, useState } from "react";

import axios from "axios";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { PlusCircle } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { getSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export const CreateStoreForm = () => {
  const { toast } = useToast();
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
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await axios.post("/api/stores", {...data, owner:'66e33ebd5951f268282136f2'});
      if (response.status === 200) {
        toast({ title: "Tienda creada con éxito" });
        reset();
      } else {
        toast({ title: "Error al crear la tienda" });
      }
    } catch (error) {
      console.error("Error al crear la tienda:", error);
      alert("Ocurrió un error. Inténtalo de nuevo.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="">
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          ID de Tiendanube
        </label>
        <input
          type="number"
          className="shadow appearance-none border rounded  py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          {...register("tiendanubeStoreId", {
            required: "El ID de Tiendanube es obligatorio",
            valueAsNumber: true, // Asegura que el valor se trate como un número
            min: { value: 1, message: "El ID debe ser mayor que 0" }, // Ejemplo de validación adicional
          })}
        />

        {errors.tiendanubeStoreId && (
          <p className="text-red-500 text-xs italic">
            {errors.tiendanubeStoreId.message}
          </p>
        )}
      </div>

      {/* Nombre de la tienda */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Nombre de la tienda
        </label>
        <input
          type="text"
          className="shadow appearance-none border rounded  py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          {...register("name", {
            required: "El nombre de la tienda es obligatorio",
          })}
        />
        {errors.name && (
          <p className="text-red-500 text-xs italic">{errors.name.message}</p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Dominio de la tienda
        </label>
        <input
          type="text"
          className="shadow appearance-none border rounded  py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          {...register("domain", {
            required: "El dominio de la tienda es obligatorio",
          })}
        />
        {errors.domain && (
          <p className="text-red-500 text-xs italic">{errors.domain.message}</p>
        )}
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Access Token
        </label>
        <input
          type="text"
          className="shadow appearance-none border rounded  py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          {...register("accessToken", {
            required: "El access token es obligatorio",
          })}
        />
        {errors.accessToken && (
          <p className="text-red-500 text-xs italic">
            {errors.accessToken.message}
          </p>
        )}
      </div>

      {/* Botón de Enviar */}
      <div className="flex items-center justify-between">
        <Button type="submit" className="">
          <PlusCircle className="h-5 w-5 mr-2" />
          Crear Tienda
        </Button>
      </div>
    </form>
  );
};
