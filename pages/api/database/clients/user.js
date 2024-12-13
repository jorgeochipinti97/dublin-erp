import { connectDB } from "@/lib/database";
import Client from "@/models/Client";
import User from "@/models/User";

connectDB();

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case "POST":
      return addUserToClient(req, res);
    case "DELETE":
      return removeUserFromClient(req, res);
    default:
      res.setHeader("Allow", ["POST", "DELETE"]);
      return res.status(405).end(`Método ${method} no permitido`);
  }
}

// Asociar un usuario a un cliente (POST)
async function addUserToClient(req, res) {
    try {
      const { clientId, userId } = req.body; // Para Pages Router, req.body ya es JSON
  
      if (!clientId || !userId) {
        return res.status(400).json({ error: "El ID del cliente y del usuario son obligatorios." });
      }
  
      const client = await Client.findById(clientId);
      if (!client) {
        return res.status(404).json({ error: "Cliente no encontrado." });
      }
  
      // Asociar el usuario al cliente
      if (!client.users.includes(userId)) {
        client.users.push(userId);
        await client.save();
      }
  
      return res.status(200).json({ message: "Usuario asociado exitosamente.", client });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  
// Eliminar un usuario de un cliente (DELETE)
async function removeUserFromClient(req, res) {
  try {
    const { clientId, userId } = JSON.parse(req.body);

    if (!clientId || !userId) {
      return res.status(400).json({ error: "El ID del cliente y del usuario son obligatorios." });
    }

    // Verificar si el cliente existe
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ error: "Cliente no encontrado." });
    }

    // Verificar si el usuario existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    // Eliminar el usuario del cliente
    client.users = client.users.filter((id) => id.toString() !== userId);
    await client.save();

    // Eliminar la asociación del cliente en el usuario
    if (user.client && user.client.toString() === clientId) {
      user.client = null;
      await user.save();
    }

    return res.status(200).json({ message: "Usuario eliminado exitosamente.", client, user });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
