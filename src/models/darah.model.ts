import mongoose from "mongoose";

const Schema = mongoose.Schema;

const DarahSchema = new Schema(
  {
    volume: {
      type: Number,
      required: true,
      min: [1, "Volume minimal 1"],
    },
    partisipanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Partisipan",
      required: true,
      unique: true,
    },
    tanggalDonor: {
      type: Date,
      default:Date.now
    },
  },
  {
    timestamps: true,
  }
);
const DarahModel = mongoose.model("Darah", DarahSchema);

export default DarahModel;