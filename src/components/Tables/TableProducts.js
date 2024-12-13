"use client";

import useProducts from "@/hooks/useProducts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import UpdateStockForm from "../UpdateStock";
import { useDepotsDatabase } from "@/hooks/useDepots";

export const TableProducts = () => {
  const { depotsDatabase } = useDepotsDatabase();
  const { products } = useProducts();
  return (
    <Table className="">
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">Nombre</TableHead>

          <TableHead className="text-center">Stock Nube</TableHead>
          <TableHead className="text-center">Stock Deposito</TableHead>
          <TableHead className="text-center hidden md:table-cell">Imágenes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) =>
          product.variants.map((variant) => (
            <TableRow key={variant.id}>
              <TableCell className="text-xs">
                {product.name.es} - {variant.sku}
              </TableCell>
              <TableCell className="text-md text-center">
                {variant.stock}
              </TableCell>
              <TableCell className="text-xs">
                {depotsDatabase.length > 0 ? (
                  depotsDatabase.map((depot) => {
                    const stockItem = depot.currentStock.find(
                      (item) => item.sku === variant.sku
                    );

                    return stockItem ? (
                      <div key={depot._id} className="flex flex-col">
                        <span className="mt-2 md:text-2xl">
                          Estanteria: {stockItem.shelf}{" "}
                        </span>
                        <span className="mt-2 md:text-2xl"> 
                          {" "}
                          Fallas: {stockItem.damaged}{" "}
                        </span>
                        <span className="mt-2 md:text-2xl">
                          Control de calidad: {stockItem.qualityControl}
                        </span>
                      </div>
                    ) : (
                      <div key={depot._id}>
                        No registrado en el depósito {depot.name}
                      </div>
                    );
                  })
                ) : (
                  <div>No hay depósitos disponibles</div>
                )}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <img
                  src={product.images[0]?.src}
                  alt={product.name.en}
                  widTableHead="50"
                  className="w-[200px] rounded-xl"
                />
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};
