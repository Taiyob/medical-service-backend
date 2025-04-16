import { Request, Response } from "express";
import { UserService } from "./user.service";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import pick from "../../../shared/pick";
import httpStatus from "http-status";
import { userFilterableField } from "./user.constant";
import { IAuthUser } from "../../interfaces/common";

const createAdminIntoDB = async (req: Request, res: Response) => {
  try {
    const result = await UserService.createAdmin(req);

    res.status(200).json({
      success: true,
      message: "Admin create successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message || "Something went wrong",
      error: error,
    });
  }
};

const createDoctorIntoDB = async (req: Request, res: Response) => {
  try {
    const result = await UserService.createDoctor(req);

    res.status(200).json({
      success: true,
      message: "Doctor create successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message || "Something went wrong",
      error: error,
    });
  }
};

const createPatientIntoDB = async (req: Request, res: Response) => {
  try {
    const result = await UserService.createPatient(req);

    res.status(200).json({
      success: true,
      message: "Patient create successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message || "Something went wrong",
      error: error,
    });
  }
};

const getAllUserFromDB = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, userFilterableField);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await UserService.getAllUser(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All users retrives successfully!!!",
    meta: result.meta,
    data: result.data,
  });
});

const updateUserStatusIntoDB = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await UserService.updateUserStatus(id, req.body);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Users staus updated successfully!!!",
      data: result,
    });
  }
);

const getMyProfileFromDB = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const user = req.user;
    const result = await UserService.getMyProfile(user as IAuthUser);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Retrived my profile successfully!!!",
      data: result,
    });
  }
);

const updateMyProfileIntoDB = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const user = req.user;
    const result = await UserService.updateMyProfile(user as IAuthUser, req);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Update my profile successfully!!!",
      data: result,
    });
  }
);

export const UserControllers = {
  createAdminIntoDB,
  createDoctorIntoDB,
  createPatientIntoDB,
  getAllUserFromDB,
  updateUserStatusIntoDB,
  getMyProfileFromDB,
  updateMyProfileIntoDB,
};
