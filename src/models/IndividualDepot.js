import mongoose from "mongoose";

const StockSchemaIndividual = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "IndividualProduct",
      required: true,
    },
    stock: {
      shelf: { type: Number, default: 0 },
      qualityControl: { type: Number, default: 0 },
      damaged: { type: Number, default: 0 },
      reserved: { type: Number, default: 0 },
    },
  },
  { _id: false }
);

const IndividualDepotSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String },
    individualProducts: [StockSchemaIndividual],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Verifica si el modelo ya existe antes de definirlo
export default mongoose.models.IndividualDepot || mongoose.model("IndividualDepot", IndividualDepotSchema);
