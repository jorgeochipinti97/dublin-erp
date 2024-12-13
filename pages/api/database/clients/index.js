import { connectDB } from "@/lib/database";
import Client from "@/models/Client"; // Modelo Client
import bcrypt from "bcrypt";

// Conectar a la base de datos
connectDB();

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case "POST":
      return createClient(req, res);
    case "GET":
      return getClients(req, res);
    case "PUT":
      return updateClient(req, res);
    case "DELETE":
      return deleteClient(req, res);
    default:
      res.setHeader("Allow", ["POST", "GET", "PUT", "DELETE"]);
      return res.status(405).json({ error: `Método ${method} no permitido` });
  }
}

// Crear un cliente (POST)
async function createClient(req, res) {
  try {
    const { name, email, password } = req.body; // Cambiado a req.body

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Todos los campos son obligatorios." });
    }

    const existingClient = await Client.findOne({ email });
    if (existingClient) {
      return res.status(400).json({ error: "El cliente ya existe." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const client = new Client({ name, email, password: hashedPassword });
    await client.save();

    return res.status(201).json({ message: "Cliente creado exitosamente.", client });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// Obtener todos los clientes (GET)
async function getClients(req, res) {
  try {
    const clients = await Client.find();
    return res.status(200).json(clients);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// Actualizar un cliente (PUT)
async function updateClient(req, res) {
  try {
    const { id, name, email, password } = req.body; // Cambiado a req.body

    if (!id) {
      return res.status(400).json({ error: "El ID es obligatorio." });
    }

    const updatedData = {};
    if (name) updatedData.name = name;
    if (email) updatedData.email = email;
    if (password) updatedData.password = await bcrypt.hash(password, 10);

    const updatedClient = await Client.findByIdAndUpdate(id, updatedData, { new: true });
    if (!updatedClient) {
      return res.status(404).json({ error: "Cliente no encontrado." });
    }

    return res.status(200).json({ message: "Cliente actualizado exitosamente.", updatedClient });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// Eliminar un cliente (DELETE)
async function deleteClient(req, res) {
  try {
    const { id } = req.body; // Cambiado a req.body

    if (!id) {
      return res.status(400).json({ error: "El ID es obligatorio." });
    }

    const deletedClient = await Client.findByIdAndDelete(id);
    if (!deletedClient) {
      return res.status(404).json({ error: "Cliente no encontrado." });
    }

    return res.status(200).json({ message: "Cliente eliminado exitosamente.", deletedClient });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
