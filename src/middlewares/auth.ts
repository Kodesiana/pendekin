import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { StatusCodes } from "http-status-codes";

export const AUTHORIZATION_SCHEME = "API-Key";

const auth = createMiddleware<{ Bindings: Env }>(async (c, next) => {
	const authHeader = c.req.header("Authorization");
	if (!authHeader) {
		throw new HTTPException(StatusCodes.UNAUTHORIZED);
	}

	const [type, authToken] = authHeader.split(" ");
	if (type !== AUTHORIZATION_SCHEME) {
		throw new HTTPException(StatusCodes.UNAUTHORIZED);
	}

	const encoder = new TextEncoder();
	const a = encoder.encode(authToken);
	const b = encoder.encode(c.env.AUTH_KEY);

	if (a.byteLength !== b.byteLength) {
		throw new HTTPException(StatusCodes.UNAUTHORIZED);
	}

	if (!crypto.subtle.timingSafeEqual(a, b)) {
		throw new HTTPException(StatusCodes.UNAUTHORIZED);
	}

	await next();
});

export default auth;
