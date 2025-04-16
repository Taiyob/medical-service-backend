import express, { NextFunction, Request, Response } from "express";
import { SpecialtiesController } from "./specialties.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { fileUploader } from "../../../helper/fileUploader";
import { SpecialtiesValidation } from "./specialties.validation";

const route = express.Router();

route.post(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = SpecialtiesValidation.create.parse(JSON.parse(req.body.data));
    return SpecialtiesController.createSpecialtiesIntoDB(req, res, next);
  }
);

route.get("/", SpecialtiesController.getAllSpecialtiesFromDB);

route.delete(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  SpecialtiesController.deleteSpecialtiesByIdFromDB
);

export const SpecialtiesRoute = route;
