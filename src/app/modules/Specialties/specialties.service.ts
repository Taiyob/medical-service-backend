import { Request } from "express";
import { fileUploader } from "../../../helper/fileUploader";
import prisma from "../../../shared/prisma";
import { IFile } from "../../interfaces/file";

const createSpecialties = async (req: Request) => {
  const file = req.file as IFile;

  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    req.body.icon = uploadToCloudinary?.secure_url;
  }

  const result = await prisma.specialties.create({
    data: req.body,
  });

  return result;
};

const getAllSpecialties = async () => {
  const result = await prisma.specialties.findMany();

  return result;
};

const deleteSpecialtiesById = async (id: string) => {
  await prisma.specialties.findUniqueOrThrow({
    where: {
      id,
    },
  });

  const result = await prisma.specialties.delete({
    where: {
      id: id,
    },
  });

  return result;
};

export const SpecialtiesService = {
  createSpecialties,
  getAllSpecialties,
  deleteSpecialtiesById,
};
