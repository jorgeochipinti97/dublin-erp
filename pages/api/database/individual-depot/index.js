
import { connectDB } from "@/lib/database";
import IndividualDepot from "@/models/IndividualDepot";
import IndividualProduct from "@/models/IndividualProduct";

export default async function handler(req, res) {
  await connectDB();

  const { method } = req;
  const { id } = req.query; // ID del depósito

  switch (method) {
    case "GET":
      try {
        if (id) {
          // Obtener un depósito específico
          const depot = await IndividualDepot.findById(id).populate(
            "individualProducts.product"
          );
          if (!depot) {
            return res.status(404).json({ error: "Depósito no encontrado" });
          }
          return res.status(200).json({ message: "Depósito obtenido", depot });
        }

        // Obtener todos los depósitos
        const depots = await IndividualDepot.find({}).populate(
          "individualProducts.product"
        );
        return res.status(200).json({ message: "Depósitos obtenidos", depots });
      } catch (error) {
        return res.status(500).json({
          error: "Error al obtener los depósitos",
          details: error.message,
        });
      }

    case "POST":
      try {
        const { name, location } = req.body;

        if (!name) {
          return res
            .status(400)
            .json({ error: "El campo 'name' es obligatorio" });
        }

        const newDepot = await IndividualDepot.create({
          name,
          location,
          individualProducts: [],
        });

        return res.status(201).json({
          message: "Depósito creado exitosamente",
          depot: newDepot,
        });
      } catch (error) {
        return res.status(500).json({
          error: "Error al crear el depósito",
          details: error.message,
        });
      }

    case "PUT":
      try {
        if (!id) {
          return res.status(400).json({
            error: "El ID del depósito es obligatorio para actualizar",
          });
        }

        const { individualProducts } = req.body;

        const updatedDepot = await IndividualDepot.findByIdAndUpdate(
          id,
          {
            $set: { individualProducts },
          },
          { new: true, runValidators: true }
        ).populate("individualProducts.product");

        if (!updatedDepot) {
          return res.status(404).json({ error: "Depósito no encontrado" });
        }

        return res.status(200).json({
          message: "Depósito actualizado exitosamente",
          depot: updatedDepot,
        });
      } catch (error) {
        return res.status(500).json({
          error: "Error al actualizar el depósito",
          details: error.message,
        });
      }

    case "DELETE":
      try {
        if (!id) {
          return res.status(400).json({
            error: "El ID del depósito es obligatorio para eliminar",
          });
        }

        const deletedDepot = await IndividualDepot.findByIdAndDelete(id);

        if (!deletedDepot) {
          return res.status(404).json({ error: "Depósito no encontrado" });
        }

        return res.status(200).json({
          message: "Depósito eliminado exitosamente",
          depot: deletedDepot,
        });
      } catch (error) {
        return res.status(500).json({
          error: "Error al eliminar el depósito",
          details: error.message,
        });
      }

    default:
      return res.status(405).json({
        error: `Método ${method} no permitido`,
        allowedMethods: ["GET", "POST", "PUT", "DELETE"],
      });
  }
}
