import { Request, Response } from "express";
import { AdminService } from "./admin.service";
import pick from "../../../shared/pick";
import { adminFilterableFields } from "./admin.constant";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import { IAdminFilterRequest } from "./admin.interface";

const getAllAdminFromDB = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, adminFilterableFields) as IAdminFilterRequest;
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await AdminService.getAllAdmin(filters, options);

  // res.status(200).json({
  //   success: true,
  //   message: "All Admin retrives successfully!!!",
  //   meta: result.meta,
  //   data: result.data,
  // });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All Admin retrives successfully!!!",
    meta: result.meta,
    data: result.data,
  });
});

const getSingleAdminDataByIdFromDB = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await AdminService.getSingleAdminDataById(id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Single Admin retrives successfully!!!",
      data: result,
    });
  }
);

const updateAdminDataByIdIntoDB = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await AdminService.updateAdminDataById(id, req.body);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Admin data updated successfully!!!",
      data: result,
    });
  }
);

const deleteAdminDataByIDFromDB = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await AdminService.deleteAdminDataByID(id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Admin data deleted successfully!!!",
      data: result,
    });
  }
);

const softlyDeleteAdminDataByIDFromDB = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await AdminService.softlyDeleteAdminDataByID(id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Admin data softly deleted successfully!!!",
      data: result,
    });
  }
);

export const AdminController = {
  getAllAdminFromDB,
  getSingleAdminDataByIdFromDB,
  updateAdminDataByIdIntoDB,
  deleteAdminDataByIDFromDB,
  softlyDeleteAdminDataByIDFromDB,
};
