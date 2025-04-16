import express from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { DoctorScheduleController } from "./doctorSchedule.controller";

const route = express.Router();

route.post(
  "/",
  auth(UserRole.DOCTOR),
  DoctorScheduleController.createDoctorScheduleIntoDB
);

route.get(
  "/my-schedule",
  auth(UserRole.DOCTOR),
  DoctorScheduleController.getAllMyScheduleFromDB
);

route.get(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
  DoctorScheduleController.getAllScheduleFromDB
);

route.delete(
  "/",
  auth(UserRole.DOCTOR),
  DoctorScheduleController.deleteDoctorScheduleByIdFromDB
);

export const DoctorScheduleRoute = route;
