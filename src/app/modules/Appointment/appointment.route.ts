import express from "express";
import { AppointMentController } from "./appointment.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import validateRequest from "../../middlewares/validateRequest";
import { AppointmentValidation } from "./appointment.validation";

const route = express.Router();

route.post(
  "/",
  auth(UserRole.PATIENT),
  validateRequest(AppointmentValidation.createAppointment),
  AppointMentController.createAppointmentIntoDB
);

route.get(
  "/my-appointment",
  auth(UserRole.PATIENT, UserRole.DOCTOR),
  AppointMentController.getMyAppointmentFromDB
);

route.get(
  "/all-appointment",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  AppointMentController.getAllAppointmentFromDB
);

route.patch(
  "/status/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR),
  AppointMentController.changeAppointmentStatusFromDB
);

export const AppointmentRoute = route;
