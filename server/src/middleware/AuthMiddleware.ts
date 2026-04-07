import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { verify } from "hono/jwt";

interface IAuthVariables {
  user_id: string;
};

const authMiddleware = createMiddleware<{ Variables: IAuthVariables; }>(async (c, next) => {
  const token = getCookie(c, "accessToken");

  if (!token) {
    throw new HTTPException(401, { message: "Unauthorized: Missing or Invalid Authorization header" });
  }

  try {
    const payload = await verify(token, Bun.env.JWT_ACCESS_SECRET as string, "HS256") as { userId: string; };
    c.set("user_id", payload.userId); // sets user_id in hono's context, access with c.get("user_id")
    await next();

  } catch (err) {
    throw new HTTPException(401, { message: "Unauthorized: Invalid or Expired token" });
  }
});

export { authMiddleware };
