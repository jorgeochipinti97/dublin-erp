"use client";
import Link from "next/link";
import { LogIn, LogOutIcon, Package2, SidebarOpen } from "lucide-react";
import { getSession, useSession } from "next-auth/react";

import { Button } from "../ui/button";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useToast } from "../ui/use-toast";
import { useEffect, useState } from "react";
import { useSidebar } from "../ui/sidebar";
import { PanelLeft } from "lucide-react";

export const Navbar = () => {
  const pathname = usePathname();
  const [session, setSession] = useState();
  const { push } = useRouter();
  const { toast } = useToast();
  const { toggleSidebar } = useSidebar();

  const handleGetSession = async () => {
    const data = await getSession();
    setSession(data);
  };
  const handleSignOut = async () => {
    try {
      await signOut({ redirect: true, callbackUrl: "/login" });
      toast({ title: "Haz cerrado sesión" });
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  useEffect(() => {
    handleGetSession();
  }, [pathname]);

  return (
    // <nav className="hidden w-full flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
    //   {session && (
    //     <div className="flex w-full">
    //       <Link
    //         href="#"
    //         className="flex items-center mx-2 gap-2 text-lg font-semibold md:text-base"
    //       >
    //         <Package2 className="h-6 w-6" />
    //         <span className="sr-only">E-FULL</span>
    //       </Link>

    //       <Link
    //         href="/"
    //         className="text-muted-foreground mx-2 transition-colors hover:text-foreground"
    //       >
    //         Estadisticas
    //       </Link>
    //       <Link
    //         href="/historial"
    //         className="text-muted-foreground mx-2 transition-colors hover:text-foreground"
    //       >
    //         Historial
    //       </Link>

    //       <div className="flex-1" />
    //     </div>
    //   )}
    //   <span className="w-[170px]">
    //     {session && `Hola ${session?.user.name} !`}
    //   </span>
    //   {session && (
    //     <Button
    //       variant="outline"
    //       className="border border-black"
    //       onClick={() => handleSignOut()}
    //     >
    //       <LogOutIcon className="h-5 w-5 mr-2" />
    //       Cerrar sesión
    //     </Button>
    //   )}
    //   {pathname !== "/login" && !session && (
    //     <Button
    //       variant="outline"
    //       className="border border-black"
    //       onClick={() => push("/login")}
    //     >
    //       <LogIn className="h-5 w-5 mr-2" />
    //       Iniciar sesión
    //     </Button>
    //   )}
    // </nav>
    <nav className="w-screen h-[5vh] flex">
      <Button onClick={toggleSidebar} className="m-3" variant="outline">
        <PanelLeft />
      </Button>
      <div className="flex-1" />
    </nav>
  );
};
