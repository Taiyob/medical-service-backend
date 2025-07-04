import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../../helper/jsonWebToken";
import config from "../../config";
import { Secret } from "jsonwebtoken";
import CustomApiError from "../errors/customApiError";
import httpStatus from "http-status";

const auth = (...role: string[]) => {
  return (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization;

      if (!token) {
        throw new CustomApiError(
          httpStatus.UNAUTHORIZED,
          "Please login with your correct credentials!!!"
        );
      }

      const decodedTokenInfo = verifyToken(
        token,
        config.jwt.access_secret as Secret
      );
      req.user = decodedTokenInfo; // now this decodedTokenInfo will go to controller where we use this auth

      if (role.length && !role.includes(decodedTokenInfo.role)) {
        throw new CustomApiError(
          httpStatus.PRECONDITION_FAILED,
          "You are not permitted for this work!!!"
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;
