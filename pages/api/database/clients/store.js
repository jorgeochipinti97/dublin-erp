import { connectDB } from "@/lib/database";
import Client from "@/models/Client";
import Store from "@/models/Store";

connectDB();

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case "POST":
      return addStoreToClient(req, res);
    case "DELETE":
      return removeStoreFromClient(req, res);
    default:
      res.setHeader("Allow", ["POST", "DELETE"]);
      return res.status(405).end(`Método ${method} no permitido`);
  }
}

// Asociar una tienda a un cliente (POST)
async function addStoreToClient(req, res) {
  try {
    const { clientId, storeId } = req.body

    if (!clientId || !storeId) {
      return res.status(400).json({ error: "El ID del cliente y de la tienda son obligatorios." });
    }

    // Verificar si el cliente existe
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ error: "Cliente no encontrado." });
    }

    // Verificar si la tienda existe
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ error: "Tienda no encontrada." });
    }

    // Asociar la tienda al cliente si no está ya asociada
    if (!client.stores.includes(storeId)) {
      client.stores.push(storeId);
      await client.save();
    }

    // Asociar el cliente a la tienda
    if (!store.owner || store.owner.toString() !== clientId) {
      store.owner = clientId;
      await store.save();
    }

    return res.status(200).json({ message: "Tienda asociada exitosamente.", client, store });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// Eliminar una tienda de un cliente (DELETE)
async function removeStoreFromClient(req, res) {
  try {
    const { clientId, storeId } = JSON.parse(req.body);

    if (!clientId || !storeId) {
      return res.status(400).json({ error: "El ID del cliente y de la tienda son obligatorios." });
    }

    // Verificar si el cliente existe
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ error: "Cliente no encontrado." });
    }

    // Verificar si la tienda existe
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ error: "Tienda no encontrada." });
    }

    // Eliminar la tienda del cliente
    client.stores = client.stores.filter((id) => id.toString() !== storeId);
    await client.save();

    // Eliminar la asociación del cliente en la tienda
    if (store.owner && store.owner.toString() === clientId) {
      store.owner = null;
      await store.save();
    }

    return res.status(200).json({ message: "Tienda eliminada exitosamente.", client, store });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
