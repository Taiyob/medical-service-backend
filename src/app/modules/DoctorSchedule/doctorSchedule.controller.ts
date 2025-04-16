import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { DoctorScheduleService } from "./doctorSchedule.service";
import { IAuthUser } from "../../interfaces/common";
import pick from "../../../shared/pick";
import { scheduleFilterableFields } from "./doctorSchedule.constant";

const createDoctorScheduleIntoDB = catchAsync(
  async (
    req: Request & { user?: IAuthUser },
    res: Response,
    next: NextFunction
  ) => {
    const user = req.user;
    const result = await DoctorScheduleService.createDoctorSchedule(
      user,
      req.body
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Doctor schedule created successfully!!!",
      data: result,
    });
  }
);

const getAllMyScheduleFromDB = catchAsync(
  async (
    req: Request & { user?: IAuthUser },
    res: Response,
    next: NextFunction
  ) => {
    const filters = pick(req.query, ["startDate", "endDate", "isBooked"]);
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
    const user = req.user;

    const result = await DoctorScheduleService.getAllMySchedule(
      filters,
      options,
      user as IAuthUser
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "My schedule retrived successfully!!!",
      data: result.data,
      meta: result.meta,
    });
  }
);

const getAllScheduleFromDB = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const filters = pick(req.query, scheduleFilterableFields);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const result = await DoctorScheduleService.getAllSchedule(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All schedule feteched successfully!!!",
    meta: result.meta,
    data: result.data,
  });
};

const deleteDoctorScheduleByIdFromDB = catchAsync(
  async (
    req: Request & { user?: IAuthUser },
    res: Response,
    next: NextFunction
  ) => {
    const user = req.user;
    const { id } = req.params;
    const result = await DoctorScheduleService.deleteDoctorScheduleById(
      user as IAuthUser,
      id
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "My schedule deleted successfully!!!",
      data: result,
    });
  }
);

export const DoctorScheduleController = {
  createDoctorScheduleIntoDB,
  getAllMyScheduleFromDB,
  getAllScheduleFromDB,
  deleteDoctorScheduleByIdFromDB,
};
