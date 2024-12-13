import mongoose from "mongoose";

// Esquema para las variantes asociadas
const VariantAssociationSchema = new mongoose.Schema({
  productId: { type: Number, required: true }, // ID principal del producto de Tiendanube
  variantId: { type: Number, required: true }, // ID de la variante
});

// Esquema para el producto individual
const IndividualProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Nombre del producto individual
    sku: { type: String, required: true, unique: true }, // SKU único
    stock: {
      shelf: { type: Number, default: 0 },
      qualityControl: { type: Number, default: 0 },
      damaged: { type: Number, default: 0 },
      reserved: { type: Number, default: 0 },
    },
    associatedVariants: [VariantAssociationSchema], // Variantes asociadas
  },
  { timestamps: true } // Agrega createdAt y updatedAt automáticamente
);

export default mongoose.models.IndividualProduct ||
  mongoose.model("IndividualProduct", IndividualProductSchema);
