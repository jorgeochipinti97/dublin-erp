"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { Home, LogIn, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Navbar } from "../Navbar";

import { usePathname, useRouter } from "next/navigation";
import { Separator } from "../ui/separator";
import { signOut, useSession } from "next-auth/react";
import { useToast } from "../ui/use-toast";

export const Header = () => {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const { push } = useRouter();
  const handleSignOut = async () => {
    try {
      const data = await signOut({ redirect: false }); // No redirige automáticamente
      toast({ title: "Haz cerrado sesión" });

      push("/login"); // Redirige manualmente después de cerrar sesión
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <Navbar />
      {session ? (
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">{pathname}</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="grid gap-6 text-lg font-medium">
              <SheetClose asChild>
                <Link
                  href="/"
                  className="flex items-center gap-2 text-lg font-semibold"
                >
                  <Home className="h-6 w-6" />
                  <span className="sr-only">E - FULL</span>
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link
                  href="/ingresos"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Ingresos
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link
                  href="/internos"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Movimientos Internos
                </Link>
              </SheetClose>
              <Separator className="my-2" />
              <SheetClose asChild>
                <Link
                  href="/orders/process"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Picking
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link
                  href="/despachos"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Despachos
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link
                  href="/devoluciones"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Devoluciones
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <div
                  onClick={handleSignOut}
                  href="/"
                  className="flex items-center gap-2 text-lg font-semibold"
                >
                  <LogOut className="h-6 w-6" />
                  Cerrar Sesión
                </div>
              </SheetClose>
            </nav>
          </SheetContent>
        </Sheet>
      ) : (
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">{pathname}</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="grid gap-6 text-lg font-medium">
              <SheetClose asChild>
                <Link
                  href="/"
                  className="flex items-center gap-2 text-lg font-semibold"
                >
                  <Home className="h-6 w-6" />
                  <span className="sr-only">E - FULL</span>
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link
                  href="/login"
                  className="flex items-center gap-2 text-lg font-semibold"
                >
                  <LogIn className="h-6 w-6" />
                  Iniciar sesión
                </Link>
              </SheetClose>
            </nav>
          </SheetContent>
        </Sheet>
      )}
    </header>
  );
};
