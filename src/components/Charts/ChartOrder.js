"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"
import { Label, Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import axios from "axios"

// Configuración de los colores y etiquetas para cada estado de orden
const chartConfig = {
  DESPACHADO: {
    label: "Despachado",
    color: "hsl(var(--chart-1))",
  },
  RETURNED: {
    label: "Devuelto",
    color: "hsl(var(--chart-2))",
  },
  PICKING: {
    label: "Picking",
    color: "hsl(var(--chart-3))",
  },
  OTRO: {
    label: "Otro",
    color: "hsl(var(--chart-4))",
  },
} 

export function ChartOrder() {
  const [chartData, setChartData] = React.useState([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get("/api/database/orders");
        const processedData = processOrderData(data);
        setChartData(processedData);
      } catch (error) {
        console.error("Error fetching orders data:", error);
      }
    };

    fetchData();
  }, []);

  const processOrderData = (orders) => {
    const orderCounts = orders.reduce((acc, order) => {
      const status = order.status.toUpperCase();
      if (!acc[status]) {
        acc[status] = 0;
      }
      acc[status] += 1;
      return acc;
    }, {});

    return Object.entries(orderCounts).map(([status, count]) => ({
      name: chartConfig[status]?.label || "Otro",
      value: count,
      fill: chartConfig[status]?.color || chartConfig["OTRO"].color,
    }));
  };

  const totalOrders = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0);
  }, [chartData]);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Distribución de Estados de Órdenes</CardTitle>
        <CardDescription>Estado actual de las ordenes</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square  w-12/12 md:w-6/12"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalOrders.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Órdenes
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">

      </CardFooter>
    </Card>
  )
}
