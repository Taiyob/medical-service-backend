import express from "express";
import { PaymentController } from "./payment.controller";

const route = express.Router();

route.get("/ipn", PaymentController.validatePayment);
route.post("/init-payment/:appointmentId", PaymentController.initPayment);

export const PaymentRoute = route;
