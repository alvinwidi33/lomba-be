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
    isCancel: {
      type: Boolean,
      default: false,
    },
    isReject: {
      type: Boolean,
      default: false,
    },
    isDone: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);
const OrderModel = mongoose.model("Order", OrderSchema);

export default OrderModel;
