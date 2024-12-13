import { connectDB } from "@/lib/database";
import User from "@/models/User";



export default async function handler(req, res) {
  await connectDB(); // Asegura conexión a la base de datos

  const { method } = req;
  const { id } = req.query;

  try {
    switch (method) {
      // Obtener usuarios
      case "GET":
        if (id) {
          const user = await User.findById(id);
          if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
          return res.status(200).json(user);
        } else {
          const users = await User.find();
          return res.status(200).json(users);
        }

      // Crear usuario
      case "POST":
        const newUser = await User.create(req.body);
        return res.status(201).json(newUser);

      // Actualizar usuario
      case "PUT":
        if (!id) return res.status(400).json({ message: "ID del usuario es requerido" });
        const updatedUser = await User.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true,
        });
        if (!updatedUser) return res.status(404).json({ message: "Usuario no encontrado" });
        return res.status(200).json(updatedUser);

      // Eliminar usuario
      case "DELETE":
        if (!id) return res.status(400).json({ message: "ID del usuario es requerido" });
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) return res.status(404).json({ message: "Usuario no encontrado" });
        return res.status(200).json({ message: "Usuario eliminado exitosamente" });

      default:
        res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
        return res.status(405).json({ message: `Método ${method} no permitido` });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
