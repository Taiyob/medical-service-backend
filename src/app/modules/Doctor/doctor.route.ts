import express from "express";
import { DoctorController } from "./doctor.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const route = express.Router();

route.get(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  DoctorController.getAllDoctorFromDB
);
route.patch("/:id", DoctorController.updateDoctorIntoDB);
route.get(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  DoctorController.getSingleDoctorDataByIdFromDB
);
route.delete(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  DoctorController.deleteDoctorDataByIDFromDB
);
route.delete(
  "/soft/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  DoctorController.softlyDeleteAdminDataByIDFromDB
);

export const DoctorRoute = route;
