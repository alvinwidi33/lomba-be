import { Request, Response } from "express";
import DarahModel from "../models/darah.model";
import * as Yup from "yup";
import { PartisipanModel, InstitusiKesehatanModel, UsersModel } from "../models/users.model";
import mongoose from "mongoose";
const createValidationSchema = Yup.object().shape({
  volume: Yup.string().required(),
  tanggalDonor: Yup.number().required(),
});
interface IPaginationQueryInstitusi {
  page?: number;
  limit?: number;
  rhesus?: string;
}
interface IPaginationQuery {
  page: number;
  limit: number;
  search?: string;
  rhesus?: string;
}

export default {
  async create(req: Request, res: Response): Promise<void> {
    try {
      await createValidationSchema.validate(req.body);
      const result = await DarahModel.create(req.body);
      res.status(201).json({
        data: result,
        message: "Success create darah",
      });
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        res.status(400).json({
          data: error.errors,
          message: "Failed create product",
        });
        return;
      }

      const err = error as Error;
      res.status(500).json({
        data: err.message,
        message: "Failed create product",
      });
    }
  },
  async findAll(req: Request, res: Response): Promise<void> {
  try {
    const { page = 1, limit = 10, search = "", rhesus } = req.query as unknown as IPaginationQuery;

    const query: any = {};

    if (rhesus) {
      const partisipanIds = await PartisipanModel.find({ rhesus }).select("_id");
      query.partisipanId = { $in: partisipanIds };
    }

    if (search) {
      const institusiIds = await InstitusiKesehatanModel.find({
        users: {
          $in: await UsersModel.find({ name: { $regex: search, $options: "i" } }).select("_id"),
        },
      }).select("_id");
      query.institusiId = { $in: institusiIds };
    }

    const result = await DarahModel.find(query)
      .populate("Partisipan")
      .populate("Institusi")
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await DarahModel.countDocuments(query);

    res.status(200).json({
      data: result,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      message: "Success get all darah",
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      data: err.message,
      message: "Failed get all darah",
    });
  }
},
  async findOne(req: Request, res: Response) {
    try {
      const result = await DarahModel.findOne({
        _id: req.params.id,
      }).populate("Partisipan").populate("Institusi");
      res.status(200).json({
        data: result,
        message: "Success get one darah",
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        data: err.message,
        message: "Failed get one darah",
      });
    }
  },
  async update(req: Request, res: Response) {
    try {
      const result = await DarahModel.findOneAndUpdate(
        { _id: req.params.id },
        req.body,
        { new: true }
      );

      res.status(200).json({
        data: result,
        message: "Success update darah",
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        data: err.message,
        message: "Failed update darah",
      });
    }
  },
  async darahByInstitusiKesehatan(req: Request, res: Response): Promise<void> {
  try {
    const { institusiName } = req.params;
    const { page = 1, limit = 10, rhesus } = req.query as unknown as IPaginationQueryInstitusi;

    const institusi = await InstitusiKesehatanModel.findOne({
      users: {
        $in: await UsersModel.find({ name: { $regex: institusiName, $options: "i" } }).select("_id"),
      },
    });

    if (!institusi) {
      res.status(404).json({
        message: "Institusi Kesehatan not found",
      });
      return;
    }

    const query: any = { institusiId: institusi._id };

    if (rhesus) {
      const partisipanIds = await PartisipanModel.find({ rhesus }).select("_id");
      query.partisipanId = { $in: partisipanIds };
    }

    const darahRecords = await DarahModel.find(query)
      .populate("Partisipan")
      .populate("Institusi")
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await DarahModel.countDocuments(query);

    res.status(200).json({
      data: darahRecords,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      message: `Success get darah for Institusi Kesehatan: ${institusiName}`,
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      message: "Failed to get darah by Institusi Kesehatan",
      error: err.message,
    });
  }
},
async getTotalVolumeDarahByInstitusi(req: Request, res: Response):Promise<void> {
  try {
    const { institusiId } = req.params;
    const totalVolume = await DarahModel.aggregate([
      {
        $match: {
          institusiId: new mongoose.Types.ObjectId(institusiId),
        },
      },
      {
        $group: {
          _id: "$institusiId",
          totalVolume: { $sum: "$volume" },
        },
      },
    ]);

    if (totalVolume.length === 0) {
      res.status(404).json({
        message: "Tidak ada darah yang ditemukan untuk institusi ini.",
      });
    }

    res.status(200).json({
      totalVolume: totalVolume[0].totalVolume,
      message: "Total volume darah berhasil dihitung.",
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        message: "Terjadi kesalahan dalam menghitung volume darah per rhesus.",
        error: error.message,
      });
    } else {
      res.status(500).json({
        message: "Terjadi kesalahan yang tidak diketahui.",
      });
    }
  }
},
async getVolumeDarahByInstitusiAndRhesus(req: Request, res: Response):Promise<void> {
  try {
    const { institusiId } = req.params;
    const volumeByRhesus = await DarahModel.aggregate([
      {
        $match: {
          institusiId: new mongoose.Types.ObjectId(institusiId),
        },
      },
      {
        $lookup: {
          from: "partisipans",
          localField: "partisipanId",
          foreignField: "_id",
          as: "partisipanDetails",
        },
      },
      {
        $unwind: "$partisipanDetails",
      },
      {
        $group: {
          _id: "$partisipanDetails.rhesus",
          totalVolume: { $sum: "$volume" },
        },
      },
    ]);

    if (volumeByRhesus.length === 0) {
      res.status(404).json({
        message: "Tidak ada darah yang ditemukan untuk institusi ini.",
      });
      return;
    }

    res.status(200).json({
      data: volumeByRhesus,
      message: "Volume darah per rhesus berhasil dihitung.",
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        message: "Terjadi kesalahan dalam menghitung volume darah per rhesus.",
        error: error.message,
      });
    } else {
      res.status(500).json({
        message: "Terjadi kesalahan yang tidak diketahui.",
      });
    }
  }
}
};
