import express from "express";
import { PatientController } from "./patient.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const route = express.Router();

route.get(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  PatientController.getAllDoctorFromDB
);

route.get("/:id", PatientController.getSinglePatientByIdFromDB);

route.patch("/:id", PatientController.updatePatientByIdFromDB);

route.delete("/:id", PatientController.deletePatientByIdFromDB);

route.delete("/soft/:id", PatientController.softlyDeletePatientByIdFromDB);

export const PatientRoute = route;
