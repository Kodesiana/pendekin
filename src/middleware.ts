import { json } from "itty-router";

import { Env, AUTHORIZATION_SCHEME, HTTP_STATUS_CODES } from "./types";

export function withAuth(request: Request, env: Env) {
	// get the Authorization header
	const auth = request.headers.get("Authorization") || "";
	const [type, key] = auth.split(" ");

	// check that the header is the expected value
	if (type !== AUTHORIZATION_SCHEME) {
		return json(
			{ message: "Unauthorized" },
			{ status: HTTP_STATUS_CODES.UNAUTHORIZED }
		);
	}

	// check that the token matches
	if (key !== env.AUTH_KEY) {
		return json(
			{ message: "Unauthorized" },
			{ status: HTTP_STATUS_CODES.UNAUTHORIZED }
		);
	}
}
