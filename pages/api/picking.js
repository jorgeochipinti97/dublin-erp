import { connectDB } from "@/lib/database";
import Order from "@/models/Order";
import Depot from "@/models/Depot";
import Movement from "@/models/Movement";
import mongoose from "mongoose";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { orderId, storeId, status, user, products } = req.body;

  try {
    await connectDB();

    const maxRetries = 5; // Número máximo de intentos para manejar conflictos
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const session = await mongoose.startSession(); // Inicia sesión para la transacción

      try {
        session.startTransaction(); // Inicia la transacción
        const timestamp = new Date();

        // Buscar la orden y el depósito en paralelo usando la sesión
        const [existingOrder, depot] = await Promise.all([
          Order.findOne({ tiendanubeOrderId: orderId }).session(session),
          Depot.findById("675c2ff50dbee3651aa8af53").session(session),
        ]);

        if (!depot) {
          throw new Error("Depósito no encontrado");
        }

        const stockMap = new Map(depot.currentStock.map((item) => [item.sku, item]));

        if (existingOrder) {
          if (existingOrder.status === "DESPACHADO") {
            throw new Error("La orden ya ha sido despachada y no puede ser modificada");
          }

          if (existingOrder.status === "PICKING" && status === "PICKING") {
            throw new Error("La orden ya está en estado PICKING");
          }

          // Validar y actualizar stock
          updateStock(stockMap, existingOrder.products);

          // Registrar el movimiento
          const movement = await createMovement(
            existingOrder.products,
            depot._id,
            user,
            session
          );

          existingOrder.movements.push(movement._id);
          existingOrder.status = status;
          existingOrder.updatedAt = timestamp;

          // Guardar los cambios
          await Promise.all([
            existingOrder.save({ session }),
            depot.updateOne(
              { currentStock: Array.from(stockMap.values()) },
              { session }
            ),
          ]);

          await session.commitTransaction(); // Confirmar la transacción
          session.endSession();

          return res.status(200).json({
            message: "Orden actualizada a PICKING y productos reservados",
          });
        }

        // Crear nueva orden
        const newOrder = new Order({
          tiendanubeOrderId: orderId,
          store: storeId,
          status: "PICKING",
          createdAt: timestamp,
          updatedAt: timestamp,
          products,
          managedBy: user,
        });

        // updateStock(stockMap, products);

        const movement = await createMovement(products, depot._id, user, session);

        newOrder.movements.push(movement._id);

        await Promise.all([
          newOrder.save({ session }),
          depot.updateOne(
            { currentStock: Array.from(stockMap.values()) },
            { session }
          ),
        ]);

        await session.commitTransaction(); // Confirmar la transacción
        session.endSession();

        return res.status(201).json({
          message: "Nueva orden creada y productos reservados",
        });
      } catch (error) {
        await session.abortTransaction(); // Abortar la transacción en caso de error
        session.endSession();

        if (error.message.includes("transaction number") && attempt < maxRetries - 1) {
          console.warn(`Intento ${attempt + 1} fallido debido a conflicto. Reintentando...`);
          continue; // Reintenta si hay conflicto de transacción
        }

        console.error("Error en la transacción:", error.message);
        throw error; // Lanza el error si no es un conflicto o si se agotaron los intentos
      }
    }
  } catch (error) {
    console.error("Error al procesar la orden:", error.message);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// Función para validar y actualizar stock
function updateStock(stockMap, products) {
  for (const product of products) {
    const stockItem = stockMap.get(product.sku);

    if (!stockItem) {
      throw new Error(`SKU ${product.sku} no encontrado en el depósito`);
    }

    if (stockItem.shelf < product.quantity) {
      throw new Error(
        `Stock insuficiente en estantería para SKU ${product.sku}`
      );
    }

    stockItem.shelf -= product.quantity;
    stockItem.reserved += product.quantity;
  }
}

// Función para registrar movimiento
async function createMovement(products, depotId, user, session) {
  const movement = new Movement({
    products: products.map((product) => ({
      sku: product.sku,
      quantity: product.quantity,
    })),
    depot: depotId,
    date: new Date(),
    type: "reserve",
    toState: "reserve",
    fromState: "shelf",
    user,
  });

  await movement.save({ session });
  return movement;
}
