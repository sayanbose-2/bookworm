import { createJwt } from "@/helper/auth/createJwt";
import { validateInputWithZod } from "@/helper/validation/validateInput";
import UserModel from "@/models/user/UserModel";
import {
  AuthLoginZodSchema, AuthRefreshZodSchema, AuthRegisterZodSchema,
  IAuthLoginInput, IAuthRefreshInput, IAuthRegisterInput
} from "@/validations/user/AuthZod";
import { HTTPException } from "hono/http-exception";
import { verify } from "hono/jwt";

const register = async (data: IAuthRegisterInput) => {
  const { displayname, email, password } = await validateInputWithZod(AuthRegisterZodSchema, data); // reassign parsed values to them

  const existingUser = await UserModel.findOne({ email });
  if (existingUser) throw new HTTPException(409, { message: `User with email: ${email} already exists` });

  const hashedPassword = await Bun.password.hash(password);
  const createdUser = await UserModel.create({ email, password: hashedPassword, displayname });

  const accessToken = await createJwt({ userId: createdUser._id, typeOfToken: "accessToken" });
  const refreshToken = await createJwt({ userId: createdUser._id, typeOfToken: "refreshToken" });

  return { message: "Successfully signed in user", accessToken, refreshToken };
};

const login = async (data: IAuthLoginInput) => {
  const { email, password } = await validateInputWithZod(AuthLoginZodSchema, data);

  const user = await UserModel.findOne({ email });
  if (!user) throw new HTTPException(404, { message: `User with email ${email} not found` });

  const valid = await Bun.password.verify(password, user.password);
  if (!valid) throw new HTTPException(401, { message: "Email or Password is invalid" });

  const accessToken = await createJwt({ userId: user._id, typeOfToken: "accessToken" });
  const refreshToken = await createJwt({ userId: user._id, typeOfToken: "refreshToken" });

  return { message: "Successfully logged in user", accessToken, refreshToken };
};

const refresh = async (data: IAuthRefreshInput) => {
  const { refreshToken } = await validateInputWithZod(AuthRefreshZodSchema, data);

  if (!refreshToken) throw new HTTPException(401, { message: "Unauthorized: Refresh token not available" });

  try {
    const payload = await verify(refreshToken, Bun.env.JWT_REFRESH_SECRET as string, "HS256") as { userId: string; };

    const newAccessToken = await createJwt({ userId: payload.userId, typeOfToken: "accessToken" });
    const newRefreshToken = await createJwt({ userId: payload.userId, typeOfToken: "refreshToken" });

    return { message: "Successfully refreshed token", accessToken: newAccessToken, refreshToken: newRefreshToken };
  } catch (err) {
    throw new HTTPException(401, { message: "Unauthorized: Invalid or Expired token" });
  }
};

export { login, refresh, register };
