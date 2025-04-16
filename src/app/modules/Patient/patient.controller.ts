import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import pick from "../../../shared/pick";
import { IPatientFilterRequest } from "./patient.interface";
import { PatientService } from "./patient.service";
import sendResponse from "../../../shared/sendResponse";
import { patientFilterableFields } from "./patient.constant";
import httpStatus from "http-status";

const getAllDoctorFromDB = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(
    req.query,
    patientFilterableFields
  ) as IPatientFilterRequest;
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await PatientService.getAllPatient(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All Patients retrived successfully!!!",
    meta: result.meta,
    data: result.data,
  });
});

const getSinglePatientByIdFromDB = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await PatientService.getSinglePatientById(id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Single Patient retrives successfully!!!",
      data: result,
    });
  }
);

const updatePatientByIdFromDB = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await PatientService.updatePatientById(id, req.body);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Patient updates successfully!!!",
      data: result,
    });
  }
);

const deletePatientByIdFromDB = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await PatientService.deletePatientById(id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Patient deleted successfully!!!",
      data: result,
    });
  }
);

const softlyDeletePatientByIdFromDB = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await PatientService.softDeletePatient(id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Patient softly deleted successfully!!!",
      data: result,
    });
  }
);

export const PatientController = {
  getAllDoctorFromDB,
  getSinglePatientByIdFromDB,
  updatePatientByIdFromDB,
  deletePatientByIdFromDB,
  softlyDeletePatientByIdFromDB,
};
