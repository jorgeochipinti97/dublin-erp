// models/User.js
import mongoose from "mongoose";

const ClientShcmea = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, unique: true },
    password: { type: String }, // Almacenarás el hash de la contraseña
    stores: [{ type: mongoose.Schema.Types.ObjectId, ref: "Store" }],
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export default mongoose.models.Client || mongoose.model("Client", ClientShcmea);
