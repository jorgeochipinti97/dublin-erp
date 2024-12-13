"use client";
import { useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Layers3 } from "lucide-react";

function UpdateStockForm({ productId, variantId, stock }) {
  const [stock_, setStock] = useState(stock);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId, variantId, stock_ }),
    });

    if (response.ok) {
      alert("Stock updated successfully");
    } else {
      alert("Error updating stock_");
    }
  };
  const handleWheel = (event) => {
    event.target.blur(); // Quitar el foco del input al hacer scroll
  };
  return (
    <form onSubmit={handleSubmit}>
      <Label>
        <Input
          type="number"
          className="my-2 w-fit"
          value={stock_}
          onChange={(e) => setStock(parseInt(e.target.value))}
          onWheel={handleWheel} // Añade el evento onWheel
        />
      </Label>
      <Button
        variant="secondary"
        className="border border-gray-600 mt-2"
        type="submit"
      >
        <Layers3 className="h-[2cap] mr-2" />
        Actualizar
      </Button>
    </form>
  );
}

export default UpdateStockForm;
