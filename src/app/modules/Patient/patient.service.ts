import { Patient, Prisma, UserStatus } from "@prisma/client";
import calculatePagination from "../../../helper/pagination";
import { IPaginationOptions } from "../../interfaces/pagination";
import { patientSearchableFields } from "./patient.constant";
import prisma from "../../../shared/prisma";
import { IPatientFilterRequest, IPatientUpdte } from "./patient.interface";

const getAllPatient = async (
  params: IPatientFilterRequest,
  options: IPaginationOptions
) => {
  const { searchTerm, ...filterData } = params;
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);

  const andConditions: Prisma.PatientWhereInput[] = [];

  if (params.searchTerm) {
    andConditions.push({
      OR: patientSearchableFields.map((field) => ({
        [field]: {
          contains: params.searchTerm,
          mode: "insensitive",
        },
      })),
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

  const whereConditions: Prisma.PatientWhereInput = { AND: andConditions };

  const result = await prisma.patient.findMany({
    where: whereConditions,
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
    include: {
      medicalReport: true,
      patientHealthData: true,
    },
  });

  const total = await prisma.patient.count({
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

const getSinglePatientById = async (id: string): Promise<Patient | null> => {
  await prisma.patient.findUniqueOrThrow({
    where: {
      id: id,
    },
  });

  const result = await prisma.patient.findUnique({
    where: {
      id: id,
      isDeleted: false,
    },
    include: {
      medicalReport: true,
      patientHealthData: true,
    },
  });

  return result;
};

const updatePatientById = async (
  id: string,
  payload: Partial<IPatientUpdte>
): Promise<Patient | null> => {
  const patientInfo = await prisma.patient.findUniqueOrThrow({
    where: {
      id: id,
      isDeleted: false,
    },
  });

  const { patientHealthData, medicalReport, ...patientData } = payload;

  await prisma.$transaction(async (txClient) => {
    const updatedPatient = await txClient.patient.update({
      where: {
        id: id,
      },
      data: patientData,
      include: {
        medicalReport: true,
        patientHealthData: true,
      },
    });

    if (patientHealthData) {
      await txClient.patientHealthData.upsert({
        where: {
          patientid: updatedPatient.id,
        },
        update: patientHealthData,
        create: { ...patientHealthData, patientid: updatedPatient.id },
      });
    }

    if (medicalReport) {
      await txClient.medicalReport.create({
        data: { ...medicalReport, patientId: updatedPatient.id },
      });
    }
  });

  const responseData = await prisma.patient.findUnique({
    where: {
      id: patientInfo.id,
    },
    include: {
      medicalReport: true,
      patientHealthData: true,
    },
  });

  return responseData;
};

const deletePatientById = async (id: string): Promise<Patient | null> => {
  const result = await prisma.$transaction(async (txClient) => {
    await txClient.patientHealthData.delete({
      where: {
        patientid: id,
      },
    });

    await txClient.medicalReport.deleteMany({
      where: {
        patientId: id,
      },
    });

    const patientInfo = await txClient.patient.delete({
      where: {
        id: id,
      },
    });

    await txClient.user.delete({
      where: {
        email: patientInfo.email,
      },
    });

    return patientInfo;
  });

  return result;
};

const softDeletePatient = async (id: string): Promise<Patient | null> => {
  return await prisma.$transaction(async (txClient) => {
    const deletePatient = await txClient.patient.update({
      where: {
        id: id,
      },
      data: {
        isDeleted: true,
      },
    });

    await txClient.user.update({
      where: {
        email: deletePatient.email,
      },
      data: {
        status: UserStatus.DELETED,
      },
    });

    return deletePatient;
  });
};

export const PatientService = {
  getAllPatient,
  getSinglePatientById,
  updatePatientById,
  deletePatientById,
  softDeletePatient,
};
