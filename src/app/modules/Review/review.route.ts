import express from "express";
import { UserRole } from "@prisma/client";
import auth from "../../middlewares/auth";
import { ReviewController } from "./review.controller";
import validateRequest from "../../middlewares/validateRequest";
import { ReviewValidation } from "./review.validation";

const route = express.Router();

route.post(
  "/",
  auth(UserRole.PATIENT),
  validateRequest(ReviewValidation.create),
  ReviewController.createReviewIntoDB
);

route.get("/", ReviewController.getAllReviewFromDB);

export const ReviewRoute = route;
