import Order from "@/models/Order";
import { connectDB } from "@/lib/database";

export default async function handler(req, res) {
  await connectDB();

  console.log("Request method:", req.method);
  console.log("Request body:", req.body);

  switch (req.method) {
    case "GET":
      try {
        const orders = await Order.find({ status: "dispatch" });
        res.status(200).json(orders);
      } catch (error) {
        console.error("Error getting orders:", error);
        res.status(500).json({ error: "Error al obtener las órdenes" });
      }
      break;
  }
}
