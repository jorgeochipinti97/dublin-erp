import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String, // URL del archivo subido a S3
      required: true,
    },
    status: {
      type: String, // Estado del reporte (e.g., "pending", "generating", "completed")
      enum: ["pending", "generating", "completed", "failed"],
      default: "pending",
    },
    metadata: {
      type: Object, // Campo opcional para guardar información adicional
      default: {},
    },
  },
  { timestamps: true } // Agrega createdAt y updatedAt automáticamente
);

export default mongoose.models.Report || mongoose.model("Report", ReportSchema);
