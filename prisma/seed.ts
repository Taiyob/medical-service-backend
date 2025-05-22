import { UserRole } from "@prisma/client";
import prisma from "../src/shared/prisma";
import * as bcrypt from "bcrypt";

const seedSuperAdmin = async () => {
  try {
    const isExistSuperAdmin = await prisma.user.findFirst({
      where: {
        role: UserRole.SUPER_ADMIN,
      },
    });

    if (isExistSuperAdmin) {
      console.log("Super Adin Already Exist");
      return;
    }

    const password = await bcrypt.hash("superadmin", 12);

    const superAdminData = await prisma.user.create({
      data: {
        email: "super@admin.com",
        password: password,
        role: UserRole.ADMIN,
        admin: {
          create: {
            name: "Mr Super Admin",
            //email: "super@admin.com",
            contactNumber: "01234567895",
          },
        },
      },
    });

    console.log("Super admin created successfully", superAdminData);
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
};

seedSuperAdmin();
