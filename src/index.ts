import { Hono } from "hono";

import * as routes from "./routes";
import * as middlewares from "./middlewares";

const app = new Hono<{ Bindings: Env }>();

app.use("/api/*", middlewares.auth);

app.route("/api/links", routes.links);
app.route("/api/statistics", routes.statistics);
app.route("", routes.redirect);

export default app;
