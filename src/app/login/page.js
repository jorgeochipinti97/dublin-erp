"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { LogIn } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Login() {
  const { session, status } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { push } = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (status === "authenticated") {
      push("/");
    }
    if (status === "unauthenticated") {
      // Usuario no autenticado, redirige a /login
      return;
    }
  }, [status]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res.ok) {
      toast({ title: "Inicio de sesión exitoso", status: "success" });
      push("/");
    } else {
      toast({
        title: "Error",
        description: "Credenciales incorrectas. Por favor, verifica tu email y contraseña.",
        status: "error",
      });
    }
  };

  return (
    <div className="">
      <div className="h-screen flex w-12/12 flex-col  justify-center items-center">
        <img src="/logo-02.jpg" className="rounded-xl w-8/12 md:w-3/12 mb-5" />

        <Card className="w-10/12 md:w-5/12">
          <CardContent>
            <CardHeader>
              <CardTitle className="text-center">Iniciar sesión</CardTitle>
            </CardHeader>
            <div className="flex justify-center">
              <form onSubmit={handleSubmit} className="w-10/12">
                <Input
                  className="my-2 "
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  required
                />
                <Input
                  type="password"
                  className="my-2 "
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña"
                  required
                />
                <Button type="submit" className="mt-5">
                  <LogIn className="mr-2 h-5 w-5" /> Iniciar sesión
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
