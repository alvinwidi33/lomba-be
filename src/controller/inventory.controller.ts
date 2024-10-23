import InventoryModel from "../models/inventory.model";
import { Request, Response } from "express";

async function getTotalStockByRhesus(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const result = await InventoryModel.aggregate([
      {
        $lookup: {
          from: "darahs",
          localField: "darahId",
          foreignField: "_id",
          as: "darah",
        },
      },
      { $unwind: "$darah" },

      {
        $lookup: {
          from: "partisipans",
          localField: "darah.partisipanId",
          foreignField: "_id",
          as: "partisipan",
        },
      },
      { $unwind: "$partisipan" },

      {
        $group: {
          _id: {
            institusiId: "$institusiId",
            rhesus: "$partisipan.rhesus",
          },
          totalStock: { $sum: "$stock" },
        },
      },

      {
        $lookup: {
          from: "institusikesehatans",
          localField: "_id.institusiId",
          foreignField: "_id",
          as: "institusi",
        },
      },
      { $unwind: "$institusi" },

      {
        $project: {
          _id: 0,
          institusi: "$institusi.users.name",
          rhesus: "$_id.rhesus",
          totalStock: 1,
        },
      },
    ]);

    res.status(200).json({
      message: "Success get total stock by rhesus",
      data: result,
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      message: "Failed to get total stock by rhesus",
      data: err.message,
    });
  }
}

export default { getTotalStockByRhesus };
