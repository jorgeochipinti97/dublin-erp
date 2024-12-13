"use client";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { TableProducts } from "@/components/Tables/TableProducts";
import { Movements } from "@/components/Movements";
import { TableMovements } from "@/components/Tables/TableMovements";
import { TableDepots } from "@/components/Tables/TableDepots";
import { InternalMovements } from "@/components/InternalMovements";

const Page = () => {
  return (
    <div className="flex max-w-screen md:overflow-x-hidden min-h-screen w-full flex-col bg-muted/40">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Tabs defaultValue="all">
            <div className="flex items-center">
              <TabsList>
                <TabsTrigger value="all">Productos</TabsTrigger>
                <TabsTrigger value="income">Ingresos</TabsTrigger>
                <TabsTrigger value="movements">
                  Movimientos internos
                </TabsTrigger>
                <TabsTrigger value="history">Historial</TabsTrigger>
                <TabsTrigger value="depots">Depositos</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="all" className="">
              <div className="w-full flex justify-center">
                <div className="w-10/12 flex justify-center">
                  <TableProducts />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="income" className="">
              <div className="w-full flex justify-center">
                <div className="w-10/12 flex justify-center">
                  <Movements />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="movements" className="">
              <div className="w-full flex justify-center">
                <div className="w-10/12 flex justify-center">
                  <InternalMovements />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="history" className="">
              <div className="w-full flex justify-center">
                <div className="w-10/12 flex justify-center">
                  <TableMovements />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="depots" className="">
              <div className="w-full flex justify-center">
                <div className="w-11/12 flex justify-center">
                  <TableDepots />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default Page;
