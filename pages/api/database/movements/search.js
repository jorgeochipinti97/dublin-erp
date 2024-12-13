import { connectDB } from "@/lib/database";
import Movement from "@/models/Movement"; // El modelo de Movimientos en MongoDB

export default async function handler(req, res) {
  await connectDB(); // Conecta a la base de datos

  const { sku, user, movementType, date, time, page = 1, limit = 30 } = req.query;

  // Construimos el query de búsqueda dinámicamente
  let query = {};

  if (sku && sku !== "all") {
    query["products.sku"] = sku;
  }

  if (user && user !== "all") {
    query.user = user;
  }

  if (movementType && movementType !== "all") {
    query.type = movementType;
  }

  // Manejo de fecha y hora sin conversión a UTC para evitar desfases
  let order = { date: -1 }; // Orden por defecto, descendente

  if (date) {
    const selectedDate = new Date(`${date}T00:00:00`); // Mantener la fecha sin UTC
    let selectedFullDate;
    let endOfHour;

    if (time) {
      // Si se proporciona la hora, combinarla con la fecha en hora local
      const [hours, minutes] = time.split(":");
      selectedFullDate = new Date(selectedDate); // Crear una fecha con la fecha proporcionada
      selectedFullDate.setHours(parseInt(hours), parseInt(minutes), 0, 0); // Ajustar la hora local seleccionada
      
      // Crear la hora de fin (hasta el final de los 59 minutos de esa hora)
      endOfHour = new Date(selectedDate);
      endOfHour.setHours(parseInt(hours), 59, 59, 999); // Fin de la hora local

      // Cambiar el orden a ascendente si se filtra por hora
      order = { date: 1 }; // Ordenar de la más antigua a la más reciente
    } else {
      // Si no se proporciona la hora, buscar a partir del inicio del día
      selectedFullDate = new Date(selectedDate);
      selectedFullDate.setHours(0, 0, 0, 0); // Inicio del día local
      endOfHour = new Date(selectedDate);
      endOfHour.setHours(23, 59, 59, 999); // Fin del día local
    }

    // Filtro por fecha/hora (hora seleccionada + 59 minutos)
    query.date = {
      $gte: selectedFullDate,
      $lte: endOfHour, // Filtrar hasta el final de los 59 minutos
    };

    // Depuración: imprimir las fechas para asegurarnos
    console.log("Filtro de fecha/hora:", selectedFullDate, "hasta", endOfHour);
  }

  try {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Buscar los movimientos aplicando los filtros
    const movements = await Movement.find(query)
      .sort(order) // Aplicar el orden (ascendente o descendente según el filtro de hora)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .populate("products");

    const totalMovements = await Movement.countDocuments(query);

    res.status(200).json({
      movements,
      totalMovements,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalMovements / limitNumber),
    });
  } catch (error) {
    console.error("Error al obtener los movimientos:", error);
    res.status(500).json({ error: "Error fetching movements" });
  }
}
