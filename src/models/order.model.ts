import mongoose from "mongoose";

const Schema = mongoose.Schema;

const OrderSchema = new Schema(
  {
    partisipanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Partisipan",
      required: true,
      unique: true,
    },
    darahId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Darah",
      required: true,
      unique: true,
    },
    volumeOrder: {
      type: Number,
      required: true,
      unique: true,
    },
    tanggalDonor: {
      type: Date,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum:["Ordered","Rejected", "Accepted","Cancelled"],
      default:"Ordered"
    }
  },
  {
    timestamps: true,
  }
);
const OrderModel = mongoose.model("Order", OrderSchema);

export default OrderModel;
