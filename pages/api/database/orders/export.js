import Order from "@/models/Order";
import { connectDB } from "@/lib/database";
import * as XLSX from "xlsx";

export default async function handler(req, res) {
  await connectDB();

  switch (req.method) {
    case "GET":
      try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
          return res.status(400).json({ error: "Fechas de inicio y fin son requeridas" });
        }

        // Convertir las fechas a objetos Date
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Ajuste para incluir todo el día de la fecha final
        end.setHours(23, 59, 59, 999);

        // Consulta para obtener las órdenes dentro del rango de fechas
        const orders = await Order.find({
          createdAt: { $gte: start, $lte: end },
        }).populate("movements");

        // Formatear los datos para exportar
        const exportData = orders.map((order) => ({
          "ID Tienda": order.store,
          "ID Pedido": order.tiendanubeOrderId,
          Estado: order.status,
          Fecha: order.createdAt.toLocaleString("es-ES", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          }),
          Movimientos: order.movements
            .map(
              (movement) =>
                `${movement.type} de ${movement.fromState} a ${movement.toState} por ${movement.user}`
            )
            .join(" | "), // Movimientos en una cadena separada por '|'
        }));

        // Crear el archivo Excel
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Órdenes");

        // Generar el archivo en un formato buffer
        const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

        // Configurar encabezados y enviar el archivo como descarga
        res.setHeader("Content-Disposition", `attachment; filename=Orders_${startDate}_to_${endDate}.xlsx`);
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.status(200).send(buffer);
      } catch (error) {
        console.error("Error exporting orders to Excel:", error);
        res.status(500).json({ error: "Error al exportar las órdenes a Excel" });
      }
      break;

    default:
      res.status(405).json({ error: "Método no permitido" });
      break;
  }
}
