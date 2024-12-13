import mongoose from "mongoose";

const StockSchema = new mongoose.Schema(
  {
    productName: { type: String },
    idNuve: { type: String },
    sku: { type: String, required: true },
    qualityControl: { type: Number, default: 0 },
    damaged: { type: Number, default: 0 },
    damagedDepot: { type: Number, default: 0 },
    shelf: { type: Number, default: 0 },
    reserved: { type: Number, default: 0 },
    dispatched: { type: Number, default: 0 },
    provider: { type: Number, default: 0 },
  },
  { _id: false }
);

const DepotSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String },
    movements: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movement" }],
    currentStock: [StockSchema],
    currentStockOutNuve: [],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.models.Depot || mongoose.model("Depot", DepotSchema);
