import React, { useState } from "react";
import { Button } from "../ui/button";
import { DownloadCloud } from "lucide-react";

export function OrderDownloader() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [loading, setLoading] = useState(false);

  const downloadOrders = async () => {
    if (!startDate || !endDate) {
      alert("Por favor selecciona un rango de fechas válido.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/stats?startDate=${startDate}&endDate=${endDate}`
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `ordenes_${startDate}_to_${endDate}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        alert("Descarga completada.");
      } else {
        console.error("Error al descargar las órdenes.");
        alert(
          "No se pudieron descargar las órdenes. Revisa el rango de fechas."
        );
      }
    } catch (error) {
      console.error("Error durante la descarga:", error);
      alert("Ocurrió un error durante la descarga.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "auto" }}>
      <h2>Descargar Órdenes EFECTIVO / CONTRAENTREGA</h2>
      <div style={{ marginBottom: "10px" }}>
        <label htmlFor="start-date">Fecha de Inicio:</label>
        <input
          id="start-date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={{ marginLeft: "10px" }}
        />
      </div>
      <div style={{ marginBottom: "10px" }}>
        <label htmlFor="end-date">Fecha de Fin:</label>
        <input
          id="end-date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={{ marginLeft: "10px" }}
        />
      </div>

      <Button onClick={downloadOrders} disabled={loading}>
        <DownloadCloud className="h-5 w-5 mr-2" />
        {loading ? "Descargando..." : "Descargar Órdenes"}
      </Button>
    </div>
  );
}
