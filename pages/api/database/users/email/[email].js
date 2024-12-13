import { connectDB } from "@/lib/database";
import User from "@/models/User";

export default async function handler(req, res) {
  if (req.method === "GET") {
    await connectDB();

    const { email } = req.query;

    try {
      // Buscar usuario por email
      const user = await User.findOne({ email }).populate("stores");

      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      res.status(200).json(user);
    } catch (error) {
      console.error("Error al buscar usuario:", error);
      res.status(500).json({ message: "Error al buscar usuario" });
    }
  } else {
    res.status(405).json({ message: "Método no permitido" });
  }
}
