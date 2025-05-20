import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import route from "./app/routes";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import notFoundError from "./app/middlewares/notFoundError";
import cookieParser from "cookie-parser";
import { AppointmentService } from "./app/modules/Appointment/appointment.service";
import cron from "node-cron";

const app: Application = express();

app.use(cors());
app.use(cookieParser());
dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

cron.schedule("* * * * *", () => {
  try {
    AppointmentService.cancelUnpaidAppointment();
    console.log("From cron node");
  } catch (error) {
    console.error(error);
  }
});

app.get("/", (req: Request, res: Response) => {
  res.send({
    Message: "E-Medi Server root point is running successfully!!!",
  });
});

app.use("/api/v1", route);

app.use(globalErrorHandler);

app.use(notFoundError);

export default app;
