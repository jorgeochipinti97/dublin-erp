"use client";

import {
  BoxesIcon,
  BoxIcon,
  FileStack,
  Home,
  LogIn,
  LogOutIcon,
  SquareMousePointer,
  Store,
  TruckIcon,
  User,
} from "lucide-react";
import { getSession, signOut } from "next-auth/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useStoreStore, useInitializeStore } from "@/hooks/useStore";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";

// Menú de Inventario.
const inventoryItems = [
  {
    title: "Ingresos",
    url: "/ingresos",
    icon: BoxIcon,
  },
  {
    title: "Movimientos internos",
    url: "/internos",
    icon: BoxesIcon,
  },
];

export function AppSidebar() {
  const isInitialized = useInitializeStore(); // Verificar inicialización de tienda
  const { setSelectedStore, selectedStore } = useStoreStore(); // Hook Zustand
  const pathname = usePathname();
  const router = useRouter();
  const { toggleSidebar } = useSidebar();

  const [session, setSession] = useState(null);
  const [stores, setStores] = useState([]);

  // Obtener tiendas desde la base de datos
  const getStores = async () => {
    try {
      const response = await axios.get("/api/database/stores");
      setStores(response.data);
    } catch (error) {
      console.error("Error al obtener tiendas:", error);
    }
  };

  const handleStoreSelect = (storeId) => {
    const selected = stores?.find((store) => store._id == storeId);
    setSelectedStore(selected);
    toast({
      title: "Tienda seleccionada",
      description: `Ahora trabajando con ${selected?.name || "N/A"}`,
    });
  };

  // Manejar sesión
  const handleGetSession = async () => {
    try {
      const data = await getSession();
      setSession(data);
    } catch (error) {
      console.error("Error al obtener sesión:", error);
    }
  };

  // Cerrar sesión
  const handleSignOut = async () => {
    try {
      await signOut({ redirect: true, callbackUrl: "/login" });
      toast({ title: "Haz cerrado sesión" });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // Inicialización del componente
  useEffect(() => {
    handleGetSession();
    getStores();
  }, [pathname]);

  // Renderización condicional
  if (!isInitialized) {
    return <div>Cargando configuración...</div>;
  }

  return (
    <Sidebar className={`${pathname?.includes("/login") && "hidden"}`}>
      <SidebarContent>
        {/* Grupo Principal */}
        <div className="flex justify-center mt-5">
          <img src="/Logo-04.jpg" className="rounded-xl w-6/12" alt="Logo" />
        </div>

        {/* Menú de Administrador */}
        {session?.user?.role.toLowerCase() === "client" && (
          <SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Selecciona tu tienda</SidebarGroupLabel>
              <Select onValueChange={handleStoreSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Elige una tienda" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((store) => (
                    <SelectItem key={store._id} value={store._id}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedStore && (
                <SidebarGroupLabel>
                  Trabajando con la tienda: {selectedStore.name}
                </SidebarGroupLabel>
              )}
            </SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem onClick={toggleSidebar}>
                  <SidebarMenuButton asChild>
                    <Link href={"/admin/users"}>
                      <User />
                      <span>Usuarios</span>
                    </Link>
                  </SidebarMenuButton>
                  <SidebarMenuButton asChild>
                    <Link href={"/admin/stores"}>
                      <Store />
                      <span>Tiendas</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem onClick={toggleSidebar}>
                  <SidebarMenuButton asChild>
                    <Link href={"/"}>
                      <Home />
                      <span>Inicio</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem onClick={toggleSidebar}>
                  <SidebarMenuButton asChild>
                    <Link href={"/historial"}>
                      <FileStack />
                      <span>Historial</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Menú de Usuario */}
        {session && (
          <>
            <SidebarGroup>
              <SidebarGroupLabel>Órdenes</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem onClick={toggleSidebar}>
                    <SidebarMenuButton asChild>
                      <Link href={"/orders/process"}>
                        <SquareMousePointer />
                        <span>Picking</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem onClick={toggleSidebar}>
                    <SidebarMenuButton asChild>
                      <Link href={"/despachos"}>
                        <TruckIcon />
                        <span>Despachos</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Inventario</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {inventoryItems.map((item) => (
                    <SidebarMenuItem key={item.title} onClick={toggleSidebar}>
                      <SidebarMenuButton asChild>
                        <Link href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      {/* Footer del Sidebar */}
      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupLabel>
            {session?.user?.name || "Invitado"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem onClick={toggleSidebar}>
                <SidebarMenuButton asChild>
                  {session ? (
                    <Button
                      variant="outline"
                      onClick={() => {
                        toggleSidebar();
                        handleSignOut();
                      }}
                    >
                      <LogOutIcon className="h-5 w-5 mr-2" />
                      Cerrar sesión
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => router.push("/login")}
                    >
                      <LogIn className="h-5 w-5 mr-2" />
                      Iniciar sesión
                    </Button>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
