import jwt, { JwtPayload, Secret } from "jsonwebtoken";

export const createToken = (
  email: string,
  role: string,
  secret: Secret,
  time: number
) => {
  const token = jwt.sign({ email, role }, secret, {
    algorithm: "HS256",
    expiresIn: time,
  });

  return token;
};

export const verifyToken = (token: string, secret: Secret) => {
  return jwt.verify(token, secret) as JwtPayload;
};
