import { Router, error, json, withContent } from "itty-router";

import { Env } from "./types";
import { withAuth } from "./middleware";
import * as routes from "./routes";

// create router and it's routes
const router = Router();
router
	// statistics route
	.get("/statistics", withAuth, routes.statistics)

	// short links routes
	.get("/short_links", withAuth, routes.list)
	.post("/short_links", withAuth, withContent, routes.create)
	.get("/short_links/:slug", withAuth, routes.detail)
	.delete("/short_links/:slug", withAuth, routes.remove)
	.get("/:slug", routes.redirect)

	// catch-all route
	.get("*", (req: Request, env: Env) => Response.redirect(env.HOST_URL));

export default {
	fetch: (request: Request, env: Env, ctx: ExecutionContext) =>
		router.handle(request, env, ctx).then(json).catch(error),
};
