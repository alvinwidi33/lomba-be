import { Request, Response } from "express";
import DarahModel from "../models/darah.model";
import * as Yup from "yup";

const createValidationSchema = Yup.object().shape({
  volume: Yup.string().required(),
  tanggalDonor: Yup.number().required(),
});

interface IPaginationQuery {
  page: number;
  limit: number;
  search?: string;
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
      const result = await DarahModel.find().populate("Partisipan");
      res.status(200).json({
        data: result,
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
      }).populate("Partisipan");
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
      ).populate("Partisipan");

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
};
