import { Doctor, Prisma, UserStatus } from "@prisma/client";
import calculatePagination from "../../../helper/pagination";
import prisma from "../../../shared/prisma";
import { ISpecialty } from "../../interfaces/speciality";
import { IPaginationOptions } from "../../interfaces/pagination";
import { doctorSearchableFields } from "./doctor.constant";
import { IDoctorFilterRequest } from "./doctor.interface";

const getAllDoctor = async (
  params: IDoctorFilterRequest,
  options: IPaginationOptions
) => {
  const { searchTerm, specialties, ...filterData } = params;
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);

  const andConditions: Prisma.DoctorWhereInput[] = [];

  if (params.searchTerm) {
    andConditions.push({
      OR: doctorSearchableFields.map((field) => ({
        [field]: {
          contains: params.searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (specialties && specialties.length > 0) {
    andConditions.push({
      doctorSpecialties: {
        some: {
          specialties: {
            title: {
              contains: specialties,
              mode: "insensitive",
            },
          },
        },
      },
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

  andConditions.push({
    isDeleted: false,
  });

  const whereConditions: Prisma.DoctorWhereInput = { AND: andConditions };

  const result = await prisma.doctor.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? {
            [options.sortBy]: options.sortOrder,
          }
        : {
            averageRating: "desc",
          },
    include: {
      doctorSpecialties: {
        include: {
          specialties: true,
        },
      },
    },
  });

  const total = await prisma.doctor.count({
    where: whereConditions,
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

const getSingleDoctornDataById = async (id: string): Promise<Doctor | null> => {
  await prisma.doctor.findUniqueOrThrow({
    where: {
      id: id,
    },
  });

  const result = await prisma.doctor.findUnique({
    where: {
      id: id,
      isDeleted: false,
    },
  });

  return result;
};

const updateDoctor = async (id: string, payload: any) => {
  const { specialties, ...doctorData } = payload;

  const doctorInfo = await prisma.doctor.findUniqueOrThrow({
    where: {
      id: id,
    },
  });

  await prisma.$transaction(async (txClient) => {
    const updateDoctorData = await txClient.doctor.update({
      where: {
        id: id,
      },
      data: doctorData,
    });

    if (specialties && specialties.length > 0) {
      const deletedSpecialtiesId = specialties.filter(
        (specialty: ISpecialty) => specialty.isDelete
      );

      for (const specialty of deletedSpecialtiesId) {
        await txClient.doctorSpecialties.deleteMany({
          where: {
            doctorId: updateDoctorData.id,
            specialtiesId: specialty.specialtiesId,
          },
        });
      }

      const createdSpecialtiesId = specialties.filter(
        (specialty: ISpecialty) => !specialty.isDelete
      );

      for (const specialty of createdSpecialtiesId) {
        await txClient.doctorSpecialties.create({
          data: {
            doctorId: updateDoctorData.id,
            specialtiesId: specialty.specialtiesId,
          },
        });
      }
    }
  });

  const result = await prisma.doctor.findUnique({
    where: {
      id: doctorInfo.id,
    },
    include: {
      doctorSpecialties: {
        include: {
          specialties: true,
        },
      },
    },
  });

  return result;
};

const deleteDoctorDataByID = async (id: string): Promise<Doctor | null> => {
  await prisma.doctor.findUniqueOrThrow({
    where: {
      id: id,
    },
  });

  const result = await prisma.$transaction(async (txClient) => {
    const deletedDoctorData = await txClient.doctor.delete({
      where: {
        id: id,
      },
    });

    await txClient.user.delete({
      where: {
        email: deletedDoctorData.email,
      },
    });

    return deletedDoctorData;
  });

  return result;
};

const softlyDeleteDoctorDataByID = async (
  id: string
): Promise<Doctor | null> => {
  await prisma.doctor.findUniqueOrThrow({
    where: {
      id: id,
      isDeleted: false,
    },
  });

  const result = await prisma.$transaction(async (txClient) => {
    const deletedAdminData = await txClient.doctor.update({
      where: {
        id: id,
      },
      data: {
        isDeleted: true,
      },
    });

    await txClient.user.update({
      where: {
        email: deletedAdminData.email,
      },
      data: {
        status: UserStatus.DELETED,
      },
    });

    return deletedAdminData;
  });

  return result;
};

export const DoctorService = {
  getAllDoctor,
  getSingleDoctornDataById,
  updateDoctor,
  deleteDoctorDataByID,
  softlyDeleteDoctorDataByID,
};
