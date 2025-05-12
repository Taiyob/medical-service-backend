import express from "express";
import { adminRoute } from "../modules/Admin/admin.route";
import { userRoute } from "../modules/User/user.route";
import { AuthRoute } from "../modules/Auth/auth.route";
import { SpecialtiesRoute } from "../modules/Specialties/specialties.route";
import { DoctorRoute } from "../modules/Doctor/doctor.route";
import { PatientRoute } from "../modules/Patient/patient.route";
import { ScheduleRoute } from "../modules/Schedule/schedule.route";
import { DoctorScheduleRoute } from "../modules/DoctorSchedule/doctorSchedule.route";
import { AppointmentRoute } from "../modules/Appointment/appointment.route";
import { PaymentRoute } from "../modules/Payment/payment.route";

const route = express.Router();

const moduleRoutes = [
  {
    path: "/user",
    route: userRoute,
  },
  {
    path: "/admin",
    route: adminRoute,
  },
  {
    path: "/auth",
    route: AuthRoute,
  },
  {
    path: "/specialties",
    route: SpecialtiesRoute,
  },
  {
    path: "/doctor",
    route: DoctorRoute,
  },
  {
    path: "/patient",
    route: PatientRoute,
  },
  {
    path: "/schedule",
    route: ScheduleRoute,
  },
  {
    path: "/doctor-schedule",
    route: DoctorScheduleRoute,
  },
  {
    path: "/appointment",
    route: AppointmentRoute,
  },
  {
    path: "/payment",
    route: PaymentRoute,
  },
];

moduleRoutes.forEach((router) => route.use(router.path, router.route));

export default route;
