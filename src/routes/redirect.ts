import { Hono } from "hono";
import { StatusCodes } from "http-status-codes";

import { notFoundHtmlContent } from "../helpers/contents";

import { getUrl } from "../repository/links";

const app = new Hono<{ Bindings: Env }>();

app.get("/:slug", async (c) => {
	// get slug from URL
	const slug = c.req.param("slug");

	// get the URL from KV
	const url = await getUrl(slug, c.env);

	// set cache control header
	c.header("Cache-Control", "private, max-age=90");

	// if the URL exists, redirect to it
	if (url) {
		// return a 301 redirect
		return c.redirect(url, StatusCodes.MOVED_PERMANENTLY);
	}

	// otherwise, return a 404
	return c.html(notFoundHtmlContent(), StatusCodes.NOT_FOUND);
});

app.get("/", async (c) => {
	return c.redirect(c.env.HOMEPAGE_URL, StatusCodes.PERMANENT_REDIRECT);
});

app.get("*", async (c) => {
	return c.html(notFoundHtmlContent(), StatusCodes.NOT_FOUND);
});

export default app;
