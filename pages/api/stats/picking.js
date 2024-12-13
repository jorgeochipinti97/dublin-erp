export default async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Método no permitido" });
    }
  
    let newReport; // Declarar fuera del bloque try
  
    try {
      // Conectar a la base de datos
      await connectDB();
  
      // // Crear un nuevo reporte con estado "pending"
      // newReport = new Report({
      //   name: "Reporte de Órdenes en PICKING",
      //   fileUrl: "",
      //   status: "pending",
      //   metadata: {},
      // });
  
      // await newReport.save();
  
      // // Obtener órdenes en estado "PICKING"
      // const pickingOrders = await Order.find({ status: "PICKING" });
  
      // if (!pickingOrders.length) {
      //   newReport.status = "failed";
      //   await newReport.save();
      //   return res.status(404).json({ message: "No hay órdenes en PICKING." });
      // }
  
      // // Configuración de Tiendanube
      // const storeId = "1935431"; // Cambia esto por tu ID de tienda
      // const accessToken = "815c1929afc4c2438cf9bdc86224d05893b10d95"; // Cambia esto por tu token
  
      // const ordersWithCustomerData = [];
      // for (const order of pickingOrders) {
      //   const customerData = await fetchCustomerData(
      //     order.tiendanubeOrderId,
      //     storeId,
      //     accessToken
      //   );
  
      //   ordersWithCustomerData.push({
      //     ID: order.tiendanubeOrderId,
      //     Cliente: customerData.name,
      //     Email: customerData.email,
      //     "Dirección": customerData.address,
      //     Productos: order.products
      //       .map(
      //         (product) =>
      //           `${product.sku} (Cantidad: ${product.quantity || 0})`
      //       )
      //       .join(", "),
      //     Responsable: order.managedBy || "No asignado",
      //     Estado: order.status,
      //     FechaCreación: new Date(order.createdAt).toLocaleDateString(),
      //     ÚltimaActualización: new Date(order.updatedAt).toLocaleDateString(),
      //   });
  
      //   // Respetar el límite de velocidad de Tiendanube
      //   await sleep(500);
      // }
  
      // // Crear el archivo Excel
      // const worksheet = XLSX.utils.json_to_sheet(ordersWithCustomerData);
      // const workbook = XLSX.utils.book_new();
      // XLSX.utils.book_append_sheet(workbook, worksheet, "Órdenes en PICKING");
      // const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
  
      // // Subir a S3
      // const s3 = new S3Client({
      //   region: process.env.AWS_S3_REGION,
      //   credentials: {
      //     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      //     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      //   },
      // });
  
      // const fileName = `reporte_picking_${Date.now()}.xlsx`;
      // const uploadParams = {
      //   Bucket: process.env.AWS_S3_BUCKET_NAME,
      //   Key: fileName,
      //   Body: excelBuffer,
      //   ContentType:
      //     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      // };
  
      // await s3.send(new PutObjectCommand(uploadParams));
  
      // const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${fileName}`;
  
      // // Actualizar el reporte en la base de datos
      // newReport.fileUrl = fileUrl;
      // newReport.status = "completed";
      // newReport.metadata = { totalOrders: pickingOrders.length };
      // await newReport.save();
  
      // res.status(200).json({
      //   message: "Reporte generado y subido con éxito",
      //   reportId: newReport._id,
      //   fileUrl,
      // });
    } catch (error) {
      console.error("Error generando el reporte:", error);
  
      // Verificar si newReport existe antes de actualizarlo
      if (newReport) {
        newReport.status = "failed";
        await newReport.save();
      }
  
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }
  