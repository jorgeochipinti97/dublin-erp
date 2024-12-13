import mongoose from 'mongoose';

const StoreSchema = new mongoose.Schema({
  tiendanubeStoreId: { type: Number, required: true, unique: true }, // ID de la tienda en Tiendanube
  name: { type: String, required: true },
  domain: { type: String },
  accessToken: { type: String, required: true }, // Token para acceder a la API de Tiendanube
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true }, // Relación con el usuario que administra la tienda

}, { timestamps: true });

export default mongoose.models.Store || mongoose.model('Store', StoreSchema);
