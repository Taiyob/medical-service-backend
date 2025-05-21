import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { MetaService } from "./meta.service";

const createMetatIntoDB = catchAsync(async (req: Request, res: Response) => {
  //const user = req.user; & { user?: IAuthUser }
  const result = await MetaService.createMeta(
    //user as IAuthUser,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Appointment created successfully!!!",
    data: result,
  });
});

export const MetaController = { createMetatIntoDB };
