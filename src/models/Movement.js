import mongoose from "mongoose";

const MovementSchema = new mongoose.Schema(
  {
    products: [
      {
        idNuve: { type: String },
        sku: { type: String },
        quantity: { type: Number,  },
      },
    ],
    user: { type: String },
    type: { type: String },
    depot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Depot",
      required: true,
      
    },
    stores: [{ type: mongoose.Schema.Types.ObjectId, ref: "Store" }],
    fromState: { type: String, required: false },
    toState: { type: String, required: false },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Movement ||
  mongoose.model("Movement", MovementSchema);
