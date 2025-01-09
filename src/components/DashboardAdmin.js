"use client";

import { useEffect, useState } from "react";
import { TableNuve } from "./Tables/TableNuve";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { useStoreStore } from "@/hooks/useStore";
import { Card, CardContent, CardTitle } from "./ui/card";
import { format } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

export const DashboardAdmin = () => {
  // Estados para almacenar las estadísticas y el estado de carga
  const [ordersStats, setOrdersStats] = useState(null);
  const [movementsStats, setMovementsStats] = useState(null);
  const [pickingOrders, setPickingOrders] = useState(0);
  const [dispatchOrders, setDispatchOrders] = useState(0);
  const [loading, setLoading] = useState(true);

  // Llamar a las estadísticas de órdenes
  const fetchOrdersStats = async () => {
    const response = await axios.get("/api/stats/ordersCount");
    setOrdersStats(response.data);
  };

  // Llamar a las estadísticas de movimientos
  const fetchMovementsStats = async () => {
    const response = await axios.get("/api/stats/movementsCount");
    setMovementsStats(response.data);
  };

  // Obtener órdenes en "PICKING" y "DESPACHO"
  const fetchPickingDispatchOrders = async () => {
    const response = await axios.get("/api/stats/ordersStatus");
    setPickingOrders(response.data.picking);
    setDispatchOrders(response.data.dispatch);
  };

  // Preparar datos para el gráfico de barras combinadas
  const getChartData = () => {
    if (!ordersStats || !movementsStats) return [];

    return ordersStats.last5DaysCounts.map((orderData, index) => {
      const movementData = movementsStats.last5DaysCounts[index];
      return {
        date: format(new Date(orderData.date), "dd MMM"),
        orders: orderData.count,
        movements: movementData ? movementData.count : 0,
      };
    });
  };

  useEffect(() => {
    // Llama a todas las funciones y muestra el contenido solo cuando todo esté listo
    const fetchData = async () => {
      await Promise.all([
        fetchOrdersStats(),
        fetchMovementsStats(),
        fetchPickingDispatchOrders(),
      ]);
      setLoading(false); // Setea loading a false cuando todos los datos estén listos
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center ">
        <p className="text-lg font-semibold text-gray-500">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="md:max-w-[70vw] p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">


        {ordersStats && (
          <motion.div
            className="shadow-lg bg-blue-50 p-6 border border-blue-300 rounded-lg"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <CardTitle className="text-xl font-semibold text-blue-600">
              📦 Resumen de Órdenes
            </CardTitle>
            <CardContent className="mt-4 text-gray-700">
              <p className="text-2xl font-bold">
                {ordersStats.totalOrders} Órdenes Totales
              </p>
              <p className="text-lg mt-2">
                Órdenes de Hoy: <strong>{ordersStats.todayCount}</strong>
              </p>
              <h4 className="mt-4 font-semibold text-sm text-gray-500">
                Órdenes en la última semana:
              </h4>
              {ordersStats.last5DaysCounts.map((day, index) => (
                <p key={index} className="text-sm mt-1">
                  {format(new Date(day.date), "dd MMM yyyy")}:{" "}
                  <span className="font-semibold">{day.count} órdenes</span>
                </p>
              ))}
            </CardContent>
          </motion.div>
        )}

        {movementsStats && (
          <motion.div
            className="shadow-lg bg-green-50 p-6 border border-green-300 rounded-lg"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <CardTitle className="text-xl font-semibold text-green-600">
              📊 Resumen de Movimientos
            </CardTitle>
            <CardContent className="mt-4 text-gray-700">
              <p className="text-2xl font-bold">
                {movementsStats.totalMovements} Movimientos Totales
              </p>
              <p className="text-lg mt-2">
                Movimientos de Hoy: <strong>{movementsStats.todayCount}</strong>
              </p>
              <h4 className="mt-4 font-semibold text-sm text-gray-500">
                Movimientos en la última semana:
              </h4>
              {movementsStats.last5DaysCounts.map((day, index) => (
                <p key={index} className="text-sm mt-1">
                  {format(new Date(day.date), "dd MMM yyyy")}:{" "}
                  <span className="font-semibold">{day.count} movimientos</span>
                </p>
              ))}
            </CardContent>
          </motion.div>
        )}
      </div>

      <motion.div
        className="shadow-lg bg-white p-6 mt-5 border border-gray-200 rounded-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <CardTitle className="text-lg font-semibold text-gray-700">
          📈 Actividad de la Última Semana
        </CardTitle>
        <CardContent className="mt-4">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getChartData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="orders" fill="#4f46e5" name="Órdenes" />
              <Bar dataKey="movements" fill="#22c55e" name="Movimientos" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <motion.div
          className="shadow-md bg-indigo-50 p-4 border border-indigo-300 rounded-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <CardTitle className="text-lg font-semibold text-indigo-600">
            Órdenes en Picking
          </CardTitle>
          <CardContent className="text-gray-700">
            <p className="text-2xl font-bold">{pickingOrders.total}</p>
            <p className="text-sm mt-1">Total Órdenes en Picking</p>
            <p className="text-md mt-4">
              Hoy: <strong>{pickingOrders.today}</strong>
            </p>
            <p className="text-md">
              Últimos 5 días: <strong>{pickingOrders.last5Days}</strong>
            </p>
          </CardContent>
        </motion.div>

        <motion.div
          className="shadow-md bg-orange-50 p-4 border border-orange-300 rounded-lg"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <CardTitle className="text-lg font-semibold text-orange-600">
            Órdenes en Despacho
          </CardTitle>
          <CardContent className="text-gray-700">
            <p className="text-2xl font-bold">{dispatchOrders.total}</p>
            <p className="text-sm mt-1">Total Órdenes en Despacho</p>
            <p className="text-md mt-4">
              Hoy: <strong>{dispatchOrders.today}</strong>
            </p>
            <p className="text-md">
              Últimos 5 días: <strong>{dispatchOrders.last5Days}</strong>
            </p>
          </CardContent>
        </motion.div>
      </div>

      <motion.div
        className="mt-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        <TableNuve />
      </motion.div>
    </div>
  );
};
