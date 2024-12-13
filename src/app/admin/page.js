"use client";
import CreateUserForm from "@/components/Forms/UserForm";
import TableUsers from "@/components/Tables/TableUsers";
import React, { useState } from "react";

const Page = () => {
  const [loading, setLoading] = useState(false); // Para controlar el estado de carga
  const [reportUrl, setReportUrl] = useState(null); // Para guardar la URL del reporte generado
  const [error, setError] = useState(null); // Para manejar errores

  const generateReport = async () => {
    setLoading(true);
    setError(null);
    setReportUrl(null);

    try {
      const response = await fetch("/api/generate-report", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Error al generar el reporte.");
      }

      const data = await response.json();
      setReportUrl(data.fileUrl); // Guardar la URL del reporte generado
    } catch (error) {
      console.error("Error generando el reporte:", error.message);
      setError("No se pudo generar el reporte. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1">
      <div className="flex justify-center mt-10">
        <div className="">
          <CreateUserForm />
        </div>
      </div>
        <div className="flex justify-center w-full">
          <TableUsers />
        </div>
      <div className="flex justify-center mt-10">
        {/* <div className="">
          <ProductForm />
        </div> */}
      </div>

      {/* <div className="flex justify-center mt-10">
        <button
          onClick={generateReport}
          disabled={loading}
          className={`px-4 py-2 text-white ${loading ? "bg-gray-500" : "bg-blue-600 hover:bg-blue-700"} rounded`}
        >
          {loading ? "Generando..." : "Generar Reporte"}
        </button>
      </div>

      {reportUrl && (
        <div className="flex justify-center mt-5">
          <a
            href={reportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            Descargar Reporte
          </a>
        </div>
      )}

      {error && (
        <div className="flex justify-center mt-5 text-red-500">
          {error}
        </div>
      )} */}
    </div>
  );
};

export default Page;
