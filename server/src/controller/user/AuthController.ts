import { setCookiesInBrowser } from "@/helper/auth/setCookie";
import { login, refresh, register } from "@/services/user/AuthService";
import { IAuthLoginInput, IAuthRegisterInput } from "@/validations/user/AuthZod";
import { Hono } from "hono";
import { getCookie } from "hono/cookie";

const authApp = new Hono();

authApp.post("/register", async (c) => {
  const body = await c.req.json<IAuthRegisterInput>();
  const { message, accessToken, refreshToken } = await register(body);

  setCookiesInBrowser({ c, token: accessToken, typeOfToken: "accessToken" });
  setCookiesInBrowser({ c, token: refreshToken, typeOfToken: "refreshToken" });

  return c.json({ message }, 201);
});

authApp.post("/login", async (c) => {
  const body = await c.req.json<IAuthLoginInput>();
  const { message, accessToken, refreshToken } = await login(body);

  setCookiesInBrowser({ c, token: accessToken, typeOfToken: "accessToken" });
  setCookiesInBrowser({ c, token: refreshToken, typeOfToken: "refreshToken" });

  return c.json({ message }, 200);
});

authApp.post("/refresh", async (c) => {
  const refreshTokenCookie = getCookie(c, "refreshToken") as string;
  const { message, accessToken, refreshToken } = await refresh({ refreshToken: refreshTokenCookie });

  setCookiesInBrowser({ c, token: accessToken, typeOfToken: "accessToken" });
  setCookiesInBrowser({ c, token: refreshToken, typeOfToken: "refreshToken" });

  return c.json({ message }, 200);
});

export default authApp;
