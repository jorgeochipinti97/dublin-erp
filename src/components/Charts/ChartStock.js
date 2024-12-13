"use client";

import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { PolarAngleAxis, Radar, RadarChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import axios from "axios";

const chartConfig = {
  qualityControl: {
    label: "C. Calidad",
    color: "hsl(var(--chart-1))",
  },
  damaged: {
    label: "Fallas",
    color: "hsl(var(--chart-2))",
  },
  damagedDepot: {
    label: "Fallas Dep.",
    color: "hsl(var(--chart-3))",
  },
  shelf: {
    label: "Estantería",
    color: "hsl(var(--chart-4))",
  },
  reserved: {
    label: "Reservado",
    color: "hsl(var(--chart-5))",
  },
  dispatched: {
    label: "Despachado",
    color: "hsl(var(--chart-6))",
  },
  provider: {
    label: "Proveedor",
    color: "hsl(var(--chart-7))",
  },
};

export function ChartStock() {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get("/api/reports/stock-distribution");

        const processedData = processStockData(data);

        setChartData(processedData);
      } catch (error) {
        console.error("Error fetching stock data:", error);
      }
    };

    fetchData();
  }, []);

  const processStockData = (stockData) => {
    return Object.entries(chartConfig).map(([key, config]) => {
      const value = stockData[key] || 0;
      return {
        category: config.label || "Otro",
        value: value,
        fill: config.color || chartConfig["qualityControl"].color,
      };
    });
  };

  return (
    <Card >
      <CardHeader className="items-center pb-4">
        <CardTitle>Distribución de Stock</CardTitle>
        <CardDescription>Estados actuales de productos</CardDescription>
      </CardHeader>
      <CardContent className="pb-0 flex justify-center">
        <ChartContainer
          config={chartConfig}
          className="aspect-square w-12/12 md:w-[50vw]"
        >
          <RadarChart data={chartData}>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <PolarAngleAxis dataKey="category" />
            <Radar
              dataKey="value"
              fill="var(--color-desktop)"
              fillOpacity={0.6}
              dot={{
                r: 4,
                fillOpacity: 1,
              }}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm"></CardFooter>
    </Card>
  );
}
