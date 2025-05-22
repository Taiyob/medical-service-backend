import { Prisma, Schedule } from "@prisma/client";
import prisma from "../../../shared/prisma";
import { addHours, addMinutes, format } from "date-fns";
import { ISchedule, IScheduleFilterRequest } from "./schedule.interface";
import { IPaginationOptions } from "../../interfaces/pagination";
import calculatePagination from "../../../helper/pagination";
import { IAuthUser } from "../../interfaces/common";

const convertDateTime = async (date: Date) => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() + offset);
};

const createSchedule = async (payload: ISchedule): Promise<Schedule[]> => {
  const { startDate, startTime, endDate, endTime } = payload;
  const intervalTime = 30;
  const schedules = [];

  const currentDate = new Date(startDate);
  const lastDate = new Date(endDate);

  while (currentDate <= lastDate) {
    const startDateTime = new Date(
      addMinutes(
        addHours(
          `${format(currentDate, "yyyy-MM-dd")}`,
          Number(startTime.split(":")[0])
        ),
        Number(startTime.split(":")[1])
      )
    );

    const endDateTime = new Date(
      addMinutes(
        addHours(
          `${format(currentDate, "yyyy-MM-dd")}`,
          Number(endTime.split(":")[0])
        ),
        Number(endTime.split(":")[1])
      )
    );

    while (startDateTime < endDateTime) {
      // const scheduleDate = {
      //   startDateTime: startDateTime,
      //   endDateTime: addMinutes(startDateTime, intervalTime),
      // };

      const s = await convertDateTime(startDateTime);
      const e = await convertDateTime(addMinutes(startDateTime, intervalTime));

      const scheduleDate = {
        startDateTime: s,
        endDateTime: e,
      };

      const existingSchedule = await prisma.schedule.findFirst({
        where: {
          startDateTime: scheduleDate.startDateTime,
          endDateTime: scheduleDate.endDateTime,
        },
      });

      if (!existingSchedule) {
        const result = await prisma.schedule.create({
          data: scheduleDate,
        });

        schedules.push(result);
      }

      startDateTime.setMinutes(startDateTime.getMinutes() + intervalTime);
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return schedules;
};

const getAllSchedule = async (
  params: IScheduleFilterRequest,
  options: IPaginationOptions,
  user: IAuthUser
) => {
  const { startDate, endDate, ...filterData } = params;
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);

  // const s = new Date(params.startDate);
  // const e = new Date(params.endDate);
  // if (isNaN(s.getTime()) || isNaN(e.getTime())) {
  //   console.error("Invalid date format");
  // }

  const andConditions: Prisma.ScheduleWhereInput[] = [];

  if (startDate && endDate) {
    andConditions.push({
      AND: [
        {
          startDateTime: {
            gte: startDate,
          },
        },
        {
          endDateTime: {
            lte: endDate,
          },
        },
      ],
    });
  }

  if (Object.keys(filterData).length > 0) {
    console.dir(Object.keys(filterData), { depth: Infinity });

    andConditions.push({
      AND: Object.keys(filterData).map((key) => {
        // Debugging logs
        console.log("Filter Data:", filterData);
        console.log("Accessing key:", key, "Value:", (filterData as any)[key]);

        return {
          [key]: {
            equals: (filterData as any)[key],
          },
        };
      }),
    });
  }

  const whereConditions: Prisma.ScheduleWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const doctorSchedule = await prisma.doctorSchedules.findMany({
    where: {
      doctor: {
        email: user?.email,
      },
    },
  });

  const doctorScheduleIds = doctorSchedule.map(
    (schedule) => schedule.scheduleId
  );

  const result = await prisma.schedule.findMany({
    where: {
      ...whereConditions,
      id: {
        notIn: doctorScheduleIds,
      },
    },
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? {
            [options.sortBy]: options.sortOrder,
          }
        : {
            createdAt: "desc",
          },
  });

  const total = await prisma.schedule.count({
    where: {
      ...whereConditions,
      id: {
        notIn: doctorScheduleIds,
      },
    },
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getSingleScheduleById = async (id: string): Promise<Schedule | null> => {
  const result = await prisma.schedule.findUniqueOrThrow({
    where: {
      id: id,
    },
  });

  return result;
};

const deleteScheduleById = async (id: string): Promise<Schedule> => {
  const result = await prisma.schedule.delete({
    where: {
      id: id,
    },
  });
  //console.log(result?.startDateTime.getHours() + ":" + result?.startDateTime.getMinutes())
  //console.log(result?.startDateTime.getUTCHours() + ":" + result?.startDateTime.getUTCMinutes())
  return result;
};

export const ScheduleService = {
  createSchedule,
  getAllSchedule,
  getSingleScheduleById,
  deleteScheduleById,
};
