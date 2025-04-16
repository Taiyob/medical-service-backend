import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { ScheduleService } from "./schedule.service";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import pick from "../../../shared/pick";
import { IAuthUser } from "../../interfaces/common";

const createScheduleIntoDB = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await ScheduleService.createSchedule(req.body);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Schedule created successfully!!!",
      data: result,
    });
  }
);

const getAllScheduleFromDB = catchAsync(
  async (
    req: Request & { user?: IAuthUser },
    res: Response,
    next: NextFunction
  ) => {
    console.log("Checking query:", req.query);
    const filters = pick(req.query, ["startDate", "endDate"]);
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
    const user = req.user;

    const result = await ScheduleService.getAllSchedule(
      filters,
      options,
      user as IAuthUser
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "All schedule retrived successfully!!!",
      data: result.data,
      meta: result.meta,
    });
  }
);

const getSingleScheduleByIdFromDB = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const result = await ScheduleService.getSingleScheduleById(id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Single schedule fetched successfully!!!",
      data: result,
    });
  }
);

const deleteScheduleByIdFromDB = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const result = await ScheduleService.deleteScheduleById(id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Deleted successfully!!!",
      data: result,
    });
  }
);

export const ScheduleController = {
  createScheduleIntoDB,
  getAllScheduleFromDB,
  getSingleScheduleByIdFromDB,
  deleteScheduleByIdFromDB,
};
