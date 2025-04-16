import { Admin, Prisma, UserStatus } from "@prisma/client";
import { adminSearchableFields } from "./admin.constant";
import calculatePagination from "../../../helper/pagination";
import prisma from "../../../shared/prisma";
import { IAdminFilterRequest } from "./admin.interface";
import { IPaginationOptions } from "../../interfaces/pagination";

const getAllAdmin = async (
  params: IAdminFilterRequest,
  options: IPaginationOptions
) => {
  const { searchTerm, ...filterData } = params;
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);

  const andConditions: Prisma.AdminWhereInput[] = [];

  if (params.searchTerm) {
    andConditions.push({
      OR: adminSearchableFields.map((field) => ({
        [field]: {
          contains: params.searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  //   if (Object.keys(filterData).length > 0) {
  //     console.dir(Object.keys(filterData), { depth: Infinity });

  //     andConditions.push({
  //       AND: Object.keys(filterData).map((key) => ({
  //         [key]: {
  //           equals: filterData[key],
  //         },
  //       })),
  //     });
  //   }

  //console.dir(andConditions, { depth: Infinity });
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

  const whereConditions: Prisma.AdminWhereInput = { AND: andConditions };

  const result = await prisma.admin.findMany({
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
  });

  const total = await prisma.admin.count({
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

const getSingleAdminDataById = async (id: string): Promise<Admin | null> => {
  await prisma.admin.findUniqueOrThrow({
    where: {
      id: id,
    },
  });

  const result = await prisma.admin.findUnique({
    where: {
      id: id,
      isDeleted: false,
    },
  });

  return result;
};

const updateAdminDataById = async (
  id: string,
  data: Partial<Admin>
): Promise<Admin> => {
  await prisma.admin.findUniqueOrThrow({
    where: {
      id: id,
      isDeleted: false,
    },
  });

  const result = await prisma.admin.update({
    where: {
      id: id,
    },
    data,
  });

  return result;
};

const deleteAdminDataByID = async (id: string): Promise<Admin | null> => {
  await prisma.admin.findUniqueOrThrow({
    where: {
      id: id,
    },
  });

  const result = await prisma.$transaction(async (txClient) => {
    const deletedAdminData = await txClient.admin.delete({
      where: {
        id: id,
      },
    });

    await txClient.user.delete({
      where: {
        email: deletedAdminData.email,
      },
    });

    return deletedAdminData;
  });

  return result;
};

const softlyDeleteAdminDataByID = async (id: string): Promise<Admin | null> => {
  await prisma.admin.findUniqueOrThrow({
    where: {
      id: id,
      isDeleted: false,
    },
  });

  const result = await prisma.$transaction(async (txClient) => {
    const deletedAdminData = await txClient.admin.update({
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

export const AdminService = {
  getAllAdmin,
  getSingleAdminDataById,
  updateAdminDataById,
  deleteAdminDataByID,
  softlyDeleteAdminDataByID,
};

// [
//     {
//       name: {
//         contains: params.searchTerm,
//         mode: "insensitive",
//       },
//     },
//     {
//       email: {
//         contains: params.searchTerm,
//         mode: "insensitive",
//       },
//     },
//   ],
