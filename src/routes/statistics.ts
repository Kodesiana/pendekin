import { Hono } from "hono";

import { getSummaryStats } from "../repository/statistics";

const app = new Hono<{ Bindings: Env }>();

app.get("/summary", async (c) => {
	return c.json(await getSummaryStats(c.env));
});

export default app;
