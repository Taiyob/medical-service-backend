import express from "express";
import { AuthController } from "./auth.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const route = express.Router();

route.post("/login", AuthController.loginUserFromDB);
route.post("/refresh-token", AuthController.refreshToken);

route.post(
  "/change-password",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
  AuthController.changePassword
);

route.post("/forgot-password", AuthController.forgotPassword);
route.post("/reset-password", AuthController.resetPassword);

export const AuthRoute = route;
