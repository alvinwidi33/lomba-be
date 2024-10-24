import { Request, Response } from "express";
import * as Yup from "yup";
import OrderModel from "../models/order.model";
import { PartisipanModel, InstitusiKesehatanModel, UsersModel} from "../models/users.model";
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
      const result = await OrderModel.create(req.body);
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
  async findOne(req: Request, res: Response) {
    try {
      const result = await OrderModel.findOne({
        _id: req.params.id,
      })
        .populate("Partisipan")
        .populate("Darah");
      res.status(200).json({
        data: result,
        message: "Success get one order",
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        data: err.message,
        message: "Failed get one order",
      });
    }
  },
  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        rhesus,
      } = req.query as unknown as IPaginationQuery;

      const query: any = {};

      if (rhesus) {
        const partisipanIds = await PartisipanModel.find({ rhesus }).select(
          "_id"
        );
        query.partisipanId = { $in: partisipanIds };
      }

      if (search) {
        const institusiIds = await InstitusiKesehatanModel.find({
          users: {
            $in: await UsersModel.find({
              name: { $regex: search, $options: "i" },
            }).select("_id"),
          },
        }).select("_id");
        query.institusiId = { $in: institusiIds };
      }

      const result = await OrderModel.find(query)
        .populate("Partisipan")
        .populate("Darah")
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await OrderModel.countDocuments(query);

      res.status(200).json({
        data: result,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        message: "Success get all order",
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        data: err.message,
        message: "Failed get all order",
      });
    }
  },
  async update(req: Request, res: Response) {
    try {
      const result = await OrderModel.findOneAndUpdate(
        { _id: req.params.id },
        req.body,
        { new: true }
      );

      res.status(200).json({
        data: result,
        message: "Success update order",
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        data: err.message,
        message: "Failed update order",
      });
    }
  },
  async darahByInstitusiKesehatan(req: Request, res: Response): Promise<void> {
    try {
      const { institusiName } = req.params;
      const {
        page = 1,
        limit = 10,
        rhesus,
      } = req.query as unknown as IPaginationQueryInstitusi;

      const institusi = await InstitusiKesehatanModel.findOne({
        users: {
          $in: await UsersModel.find({
            name: { $regex: institusiName, $options: "i" },
          }).select("_id"),
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
        const partisipanIds = await PartisipanModel.find({ rhesus }).select(
          "_id"
        );
        query.partisipanId = { $in: partisipanIds };
      }

      const orderRecords = await OrderModel.find(query)
        .populate("Partisipan")
        .populate("Order")
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await OrderModel.countDocuments(query);

      res.status(200).json({
        data: orderRecords,
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
};
