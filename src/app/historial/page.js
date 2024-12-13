"use client";
import { DashboardAdmin } from "@/components/DashboardAdmin";
import React, { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TableMovements } from "@/components/Tables/TableMovements";
import { TableOrders } from "@/components/Tables/TableOrders";
import { TableDepots } from "@/components/Tables/TableDepots";
import { getSession, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const Page = () => {

  const fetchSession = async () => {
    const session = await getSession();

    if (!session) {
      push("/login");
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  return (
    <div className="w-screen flex justify-center">
      <Tabs defaultValue="moves" className="w-10/12">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="moves">Movimientos</TabsTrigger>
          <TabsTrigger value="depo">Deposito</TabsTrigger>
          <TabsTrigger value="orders">Ordenes</TabsTrigger>
        </TabsList>
        <TabsContent value="moves">
          <TableMovements />
        </TabsContent>
        <TabsContent value="depo">
          <TableDepots />
        </TabsContent>
        <TabsContent value="orders">
          <TableOrders />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Page;
