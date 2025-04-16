import { UserStatus } from "@prisma/client";
import { createToken, verifyToken } from "../../../helper/jsonWebToken";
import prisma from "../../../shared/prisma";
import * as bcrypt from "bcrypt";
import CustomApiError from "../../errors/customApiError";
import httpStatus from "http-status";
import config from "../../../config";
import { Secret } from "jsonwebtoken";
import emailSender from "../../../helper/emailSender";

const loginUser = async (payLoad: { email: string; password: string }) => {
  const existUser = await prisma.user.findUniqueOrThrow({
    where: {
      email: payLoad.email,
      status: UserStatus.ACTIVE,
    },
  });

  const isPasswordMatch: boolean = await bcrypt.compare(
    payLoad.password,
    existUser.password
  );

  if (!isPasswordMatch) {
    throw new Error("Password is incorrect, please give correct passrord!!!");
  }

  const accessToken = createToken(
    existUser.email,
    existUser.role,
    process.env.ACCESS_SECRET as string,
    900000
  );

  const refreshToken = createToken(
    existUser.email,
    existUser.role,
    process.env.REFRESH_SECRET as string,
    172800000
  );

  return {
    accessToken: accessToken,
    refreshToken: refreshToken,
    needPasswordChange: existUser.needPasswordChange,
  };
};

const refreshToken = async (token: string) => {
  let decodedData;
  try {
    decodedData = verifyToken(token, process.env.REFRESH_SECRET as string);
  } catch (error) {
    throw new Error("You are not authorized!");
  }

  const isUserExist = await prisma.user.findUniqueOrThrow({
    where: {
      email: decodedData?.email,
      status: UserStatus.ACTIVE,
    },
  });

  const accessToken = createToken(
    isUserExist.email,
    isUserExist.role,
    process.env.ACCESS_SECRET as string,
    900000
  );

  return {
    accessToken: accessToken,
    needPasswordChange: isUserExist.needPasswordChange,
  };
};

const changePassword = async (user: any, payLoad: any) => {
  const isUserExist = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
      status: UserStatus.ACTIVE,
    },
  });

  const isPasswordMatch: boolean = await bcrypt.compare(
    payLoad.oldPassword,
    isUserExist.password
  );

  if (!isPasswordMatch) {
    throw new CustomApiError(
      httpStatus.FORBIDDEN,
      "Password is incorrect, please give correct passrord!!!"
    );
  }

  const hashedPassword: string = await bcrypt.hash(payLoad.newPassword, 12);

  await prisma.user.update({
    where: {
      email: user.email,
    },
    data: {
      password: hashedPassword,
      needPasswordChange: false,
    },
  });

  return {
    message: "Password changed successfully",
  };
};

const forgotPassword = async (payLoad: { email: string }) => {
  const isUserExist = await prisma.user.findUniqueOrThrow({
    where: {
      email: payLoad.email,
      status: UserStatus.ACTIVE,
    },
  });

  if (!isUserExist) {
    throw new CustomApiError(
      httpStatus.UNAUTHORIZED,
      "Ihis user is not exist, email is wrong, please give expected email!!!"
    );
  }

  /*
  1 minute = 60,000 milliseconds

  5 minutes = 5 × 60,000 = 300,000 milliseconds
  */

  const resetPassToken = createToken(
    isUserExist.email,
    isUserExist.role,
    config.jwt.reset_secret as Secret,
    300000
  );

  const resetPassLink =
    config.reset_pass_link + `?id=${isUserExist.id}&token=${resetPassToken}`;

  await emailSender(
    isUserExist.email,
    `
      <div>
        <p>Dear User,</p>
        <p>
          Your Password reset link
          <a href=${resetPassLink}>
            Reset Password
          </a>
        </p>
      </div>
    `
  );
};

const resetPassword = async (
  token: string,
  payLoad: { id: string; password: string }
) => {
  const isUserExist = await prisma.user.findUniqueOrThrow({
    where: {
      id: payLoad.id,
      status: UserStatus.ACTIVE,
    },
  });

  if (!isUserExist) {
    throw new CustomApiError(
      httpStatus.NOT_FOUND,
      "Ihis user is not exist, email is wrong, please give expected email!!!"
    );
  }

  const isValidToken = verifyToken(token, config.jwt.reset_secret as Secret);
  if (!isValidToken) {
    throw new CustomApiError(
      httpStatus.FORBIDDEN,
      "Ihis user is not exist, email is wrong, please give expected email!!!"
    );
  }

  const hashedPassword: string = await bcrypt.hash(payLoad.password, 12);

  const result = await prisma.user.update({
    where: {
      id: payLoad.id,
    },
    data: {
      password: hashedPassword,
      needPasswordChange: false,
    },
  });

  return result;
};

export const AuthService = {
  loginUser,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
};
