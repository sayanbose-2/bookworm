import { sign } from "hono/jwt";
import { Types } from "mongoose";

interface ICreateJwt {
  typeOfToken: "accessToken" | "refreshToken";
  userId: Types.ObjectId | string;
}

const getExp = (time: "1h" | "7d") => {
  return time === "1h" ?
    Math.floor((Date.now() / 1000) + (60 * 60)) : // 1hr
    Math.floor((Date.now() / 1000) + (60 * 60 * 24 * 7)); // 7 d
};

const createJwt = async (data: ICreateJwt) => {
  const { userId, typeOfToken } = data;

  const token = await sign({
    userId: userId,
    exp: typeOfToken === "accessToken" ? getExp("1h") : getExp("7d")
  }, typeOfToken === "accessToken" ?
    Bun.env.JWT_ACCESS_SECRET as string :
    Bun.env.JWT_REFRESH_SECRET as string
  );

  return token;
};

export { createJwt };
