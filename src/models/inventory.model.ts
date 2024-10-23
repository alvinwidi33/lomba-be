import mongoose from "mongoose";

const Schema = mongoose.Schema;

const InventorySchema = new Schema(
  {
    stock: {
      type: Number,
      required: true,
    },
    institusiId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institusi Kesehatan",
      required: true,
    },
    darahId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Darah",
      required: true,
      min: [1, "Volume minimal 1"],
    },
    tanggalOrder: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);
const InventoryModel = mongoose.model("Inventory", InventorySchema);

export default InventoryModel;
