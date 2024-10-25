import mongoose from "mongoose";
import { encrypt } from "../utils/encryption";
import { SECRET } from "../utils/env";

const Schema = mongoose.Schema;

const UsersSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    no_telp: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    roles: {
      type: String,
      default: "Partisipan",
      enum: ["Partisipan", "Admin", "Institusi Kesehatan"],
    },
    isVerify: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

UsersSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = encrypt(SECRET, user.password);
  }
  next();
});

UsersSchema.pre("updateOne", async function (next) {
  const user = (this as unknown as { _update: any })._update;
  if (user.password) {
    user.password = encrypt(SECRET, user.password);
  }
  next();
});

UsersSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const PartisipanSchema = new Schema({
  partisipan_id: {
    type: mongoose.Schema.Types.ObjectId,
    default: function () {
      return new mongoose.Types.ObjectId();
    },
    unique: true,
  },
  users: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
    unique: true,
  },
  rhesus: {
    type: String,
    required:false,
    default:null,
  },
  domisili: {
    type: String,
    required:false,
    default:null,
  },
  alamat: {
    type: String,
    required: false,
    default:null,
  },
  penyakit_bawaan: {
    type: String,
    default: null,
  },
});

const InstitusiKesehatanSchema = new Schema({
  institusi_id: {
    type: mongoose.Schema.Types.ObjectId,
    default: function () {
      return new mongoose.Types.ObjectId();
    },
    unique: true,
  },
  users: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
    unique: true,
  },
});

const AdminSchema = new Schema({
  admin_id: {
    type: mongoose.Schema.Types.ObjectId,
    default: function () {
      return new mongoose.Types.ObjectId();
    },
    unique: true,
  },
  users: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
    unique: true,
  },
});

const UsersModel = mongoose.model("Users", UsersSchema);
const PartisipanModel = mongoose.model("Partisipan", PartisipanSchema);
const InstitusiKesehatanModel = mongoose.model("Institusi Kesehatan", InstitusiKesehatanSchema);
const AdminModel = mongoose.model("Admin", AdminSchema);

export { UsersModel, PartisipanModel, InstitusiKesehatanModel, AdminModel };
