import express from "express";
import { PrescriptionController } from "./prescription.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const route = express.Router();

route.post(
  "/",
  auth(UserRole.DOCTOR),
  PrescriptionController.createPrescriptionIntoDB
);

export const PrescriptionRoute = route;
