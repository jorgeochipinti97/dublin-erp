import mongoose from "mongoose";

const IndividualProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true },
  idNuve: { type: Number, required: true },
  stock: {
    qualityControl: { type: Number, default: 0 },
    damaged: { type: Number, default: 0 },
    shelf: { type: Number, default: 0 },
    reserved: { type: Number, default: 0 },
  },
});

const VariantSchema = new mongoose.Schema({
  idNuveVariant: { type: Number, required: true },
  skuNuve: { type: String, required: true },
  name: { type: String },
  individualProducts: [IndividualProductSchema],
});

const ProductSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    store: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
    idNuve: { type: Number, required: true },
    variants: [VariantSchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);
