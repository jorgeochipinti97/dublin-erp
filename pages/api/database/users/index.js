import { connectDB } from "@/lib/database";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  await connectDB();

  const { method } = req;

  try {
    switch (method) {
      // Obtener todos los usuarios
      case "GET":
        const users = await User.find();
        return res.status(200).json(users);

      // Crear un nuevo usuario
      case "POST":
        const { email, password, ...rest } = req.body;

        if (!email || !password) {
          return res
            .status(400)
            .json({ message: "Email y contraseña son requeridos" });
        }

        // Verificar si el usuario ya existe
        const userExists = await User.findOne({ email });
        if (userExists) {
          return res.status(400).json({ message: "El usuario ya existe" });
        }

        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear el nuevo usuario con la contraseña encriptada
        const newUser = await User.create({ email, password: hashedPassword, ...rest });
        return res.status(201).json(newUser);

      // Actualizar un usuario
      case "PUT":
        const { id } = req.query;
        if (!id) {
          return res
            .status(400)
            .json({ message: "Se requiere el ID del usuario" });
        }

        const updates = req.body;
        const updatedUser = await User.findByIdAndUpdate(id, updates, {
          new: true,
        });

        if (!updatedUser) {
          return res.status(404).json({ message: "Usuario no encontrado" });
        }

        return res
          .status(200)
          .json({ message: "Usuario actualizado", user: updatedUser });

      default:
        res.setHeader("Allow", ["GET", "POST", "PUT"]);
        return res
          .status(405)
          .json({ message: `Método ${method} no permitido` });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
