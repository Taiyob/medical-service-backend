import { Prisma } from "@prisma/client";
import prisma from "../../../shared/prisma";
import CustomApiError from "../../errors/customApiError";
import { IAuthUser } from "../../interfaces/common";
import httpStatus from "http-status";
import { IPaginationOptions } from "../../interfaces/pagination";
import calculatePagination from "../../../helper/pagination";

const createReview = async (user: IAuthUser, payload: any) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user?.email,
    },
  });

  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: payload.appointmentId,
    },
  });

  if (!(patientData.id === appointmentData.patientId)) {
    throw new CustomApiError(
      httpStatus.BAD_REQUEST,
      "You are not under this appointment"
    );
  }

  return await prisma.$transaction(async (tx) => {
    const createReview = await tx.review.create({
      data: {
        appointmentId: appointmentData.id,
        doctorId: appointmentData.doctorId,
        patientId: appointmentData.patientId,
        rating: payload.rating,
        comment: payload.comment,
      },
    });

    const averageRating = await tx.review.aggregate({
      _avg: {
        rating: true,
      },
    });

    await tx.doctor.update({
      where: {
        id: createReview.doctorId,
      },
      data: {
        averageRating: averageRating._avg.rating as number,
      },
    });

    return createReview;
  });
};

const getAllReview = async (filters: any, options: IPaginationOptions) => {
  const { limit, page, skip } = calculatePagination(options);
  const { patientEmail, doctorEmail } = filters;
  const andConditions = [];

  if (patientEmail) {
    andConditions.push({
      patient: {
        email: patientEmail,
      },
    });
  }

  if (doctorEmail) {
    andConditions.push({
      doctor: {
        email: doctorEmail,
      },
    });
  }

  const whereConditions: Prisma.ReviewWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.review.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : {
            createdAt: "desc",
          },
    include: {
      doctor: true,
      patient: true,
      //appointment: true,
    },
  });
  const total = await prisma.review.count({
    where: whereConditions,
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

export const ReviewService = { createReview, getAllReview };
