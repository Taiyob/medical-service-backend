import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { SpecialtiesService } from "./specialties.service";

const createSpecialtiesIntoDB = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await SpecialtiesService.createSpecialties(req);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Successfully created!!!",
      data: result,
    });
  }
);

const getAllSpecialtiesFromDB = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await SpecialtiesService.getAllSpecialties();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Successfully retrived!!!",
      data: result,
    });
  }
);

const deleteSpecialtiesByIdFromDB = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const result = await SpecialtiesService.deleteSpecialtiesById(id);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Successfully deleted!!!",
      data: result,
    });
  }
);

export const SpecialtiesController = {
  createSpecialtiesIntoDB,
  getAllSpecialtiesFromDB,
  deleteSpecialtiesByIdFromDB,
};
