// /pages/api/stats/ordersStatus.js

import Order from "@/models/Order";
import { connectDB } from "@/lib/database";
import dayjs from "dayjs";

export default async function handler(req, res) {
  await connectDB();

  try {
    // Definir el inicio de hoy y hace 5 días usando dayjs
    const todayStart = dayjs().startOf("day").toDate();
    const fiveDaysAgo = dayjs().subtract(5, "days").startOf("day").toDate();

    // Conteo total de órdenes en estado "PICKING"
    const pickingTotal = await Order.countDocuments({ status: "PICKING" });
    // Conteo de órdenes en estado "PICKING" en el día de hoy y en los últimos 5 días
    const pickingToday = await Order.countDocuments({
      status: "PICKING",
      createdAt: { $gte: todayStart },
    });
    const pickingLast5Days = await Order.countDocuments({
      status: "PICKING",
      createdAt: { $gte: fiveDaysAgo },
    });

    // Conteo total de órdenes en estado "DESPACHADO"
    const dispatchTotal = await Order.countDocuments({ status: "DESPACHADO" });
    // Conteo de órdenes en estado "DESPACHADO" en el día de hoy y en los últimos 5 días
    const dispatchToday = await Order.countDocuments({
      status: "DESPACHADO",
      createdAt: { $gte: todayStart },
    });
    const dispatchLast5Days = await Order.countDocuments({
      status: "DESPACHADO",
      createdAt: { $gte: fiveDaysAgo },
    });

    res.status(200).json({
      picking: {
        total: pickingTotal,
        last5Days: pickingLast5Days,
        today: pickingToday,
      },
      dispatch: {
        total: dispatchTotal,
        last5Days: dispatchLast5Days,
        today: dispatchToday,
      },
    });
  } catch (error) {
    console.error("Error al obtener el estado de las órdenes:", error);
    res.status(500).json({ message: "Error al obtener el estado de las órdenes" });
  }
}

