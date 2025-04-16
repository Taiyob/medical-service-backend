import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { DoctorService } from "./doctor.service";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import pick from "../../../shared/pick";
import { doctorFilterableFields } from "./doctor.constant";
import { IDoctorFilterRequest } from "./doctor.interface";

const getAllDoctorFromDB = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(
    req.query,
    doctorFilterableFields
  ) as IDoctorFilterRequest;
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await DoctorService.getAllDoctor(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All Doctor retrives successfully!!!",
    meta: result.meta,
    data: result.data,
  });
});

const getSingleDoctorDataByIdFromDB = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await DoctorService.getSingleDoctornDataById(id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Single Doctor retrives successfully!!!",
      data: result,
    });
  }
);

const updateDoctorIntoDB = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const result = await DoctorService.updateDoctor(id, req.body);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Doctor updated successfully",
      data: result,
    });
  }
);

const deleteDoctorDataByIDFromDB = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await DoctorService.deleteDoctorDataByID(id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Doctor data deleted successfully!!!",
      data: result,
    });
  }
);

const softlyDeleteAdminDataByIDFromDB = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await DoctorService.softlyDeleteDoctorDataByID(id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Doctor data softly deleted successfully!!!",
      data: result,
    });
  }
);

export const DoctorController = {
  getAllDoctorFromDB,
  getSingleDoctorDataByIdFromDB,
  updateDoctorIntoDB,
  deleteDoctorDataByIDFromDB,
  softlyDeleteAdminDataByIDFromDB,
};
