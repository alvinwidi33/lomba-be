import mongoose from "mongoose";

const Schema = mongoose.Schema;

const DarahSchema = new Schema(
  {
    partisipanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Partisipan",
      required: true,
      unique: true,
    },
    inventoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
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
const DarahModel = mongoose.model("Darah", DarahSchema);

export default DarahModel;
