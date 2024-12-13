import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    tiendanubeOrderId: { type: Number, unique: true },
    customer: {
      name: { type: String },
      email: { type: String },
      address: { type: String },
    },
    products: [
      {
        sku: { type: String },
        idNuve: { type: Number },
        quantity: { type: Number },
      },
    ],
    movements: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movement" }],
    status: { type: String },
    managedBy: { type: String },
    store: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
