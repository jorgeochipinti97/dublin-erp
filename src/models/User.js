// models/User.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true }, // Almacenarás el hash de la contraseña
    role: {
      type: String,
      enum: ["admin", "employee"], default:"employee"
    },
    active: { type: Boolean, default: true }, // Campo para activar/desactivar usuario
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true }, // Relación con el usuario que administra la tienda
    permissions: [
      {
        type: String, // Permisos específicos
        enum: [
          "view_products",
          "picking", // Gestión de picking
          "despacho", // Gestión de despacho
          "movimiento_interno", // Gestión de movimientos internos
          "ingresos", // Gestión de ingresos
          "view_orders",
          "view_users",
          "manage_users",
          "custom_permission", // Otros permisos adicionales si los necesitas
        ],
      },
    ],
    client:   { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: false },
    
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
