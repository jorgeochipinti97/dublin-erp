"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

// Configuración de colores para el gráfico
const chartConfig = {
  totalQuantity: {
    label: "Cantidad Vendida",
    color: "hsl(var(--chart-1))",
  },
} 

// Componente ProductSalesChart
export function ProductSalesChart({ data, title, description }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title || "Productos Más Vendidos"}</CardTitle>
        <CardDescription>{description || "Últimos 7 días"}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 10)} // Limita el nombre del producto a 10 caracteres
            />
            <YAxis />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="totalQuantity" fill="var(--color-totalQuantity)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          {description || "Productos más vendidos esta semana"}{" "}
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Mostrando los productos con mayores ventas en los últimos 7 días.
        </div>
      </CardFooter>
    </Card>
  )
}
