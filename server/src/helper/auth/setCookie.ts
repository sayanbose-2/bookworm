import { Context } from "hono";
import { setCookie } from "hono/cookie";

interface ISetCookie {
  c: Context;
  token: string;
  typeOfToken: "accessToken" | "refreshToken";
}

const setCookiesInBrowser = (data: ISetCookie) => {
  const { c, token, typeOfToken } = data;

  setCookie(c, typeOfToken, token, {
    httpOnly: true,
    sameSite: Bun.env.NODE_ENV === "Development" ? "lax" : "none",
    secure: Bun.env.NODE_ENV !== "Development",
    maxAge: typeOfToken === "accessToken" ?
      60 * 60 : // 1 hr
      60 * 60 * 24 * 7 // 7 days
  });
};

export { setCookiesInBrowser };
