import { Hono } from "hono";
import { vValidator } from "@hono/valibot-validator";

import * as v from "valibot";
import { StatusCodes } from "http-status-codes";

import { create, generateSlug, getUrl, remove } from "../repository/links";
import { getStats } from "../repository/statistics";

const app = new Hono<{ Bindings: Env }>();

app.get(
	"/",
	vValidator(
		"query",
		v.object({
			prefix: v.optional(v.string()),
			size: v.optional(v.pipe(v.string(), v.transform(Number), v.minValue(1), v.maxValue(100)), "10"),
			cursor: v.optional(v.string()),
		}),
	),
	async (c) => {
		// get the data
		const data = c.req.valid("query");

		// get the list of keys
		const slugs = await c.env.SHORT_URLS.list({
			prefix: data.prefix,
			limit: data.size,
			cursor: data.cursor,
		});

		if (slugs.keys.length === 0) {
			return c.notFound();
		}

		// get the stats
		const stats = await Promise.all(
			slugs.keys.map(async (key) => {
				return {
					slug: key.name,
					url: await getUrl(key.name, c.env),
					hits: await getStats(key.name, c.env),
				};
			}),
		);

		// return the list of slugs
		return c.json({
			// @ts-expect-error
			cursor: slugs.cursor,
			isComplete: slugs.list_complete,
			data: stats,
		});
	},
);

app.post(
	"/",
	vValidator(
		"json",
		v.object({
			slug: v.optional(v.pipe(v.string(), v.maxLength(100, ""))),
			url: v.pipe(v.string(), v.nonEmpty(), v.url()),
		}),
	),
	async (c) => {
		// get the data
		const data = c.req.valid("json");

		// check if the slug already exists
		let slug = data.slug;
		if (slug) {
			const url = await getUrl(slug, c.env);
			if (url) {
				return c.json({ message: "Slug already exists" }, StatusCodes.CONFLICT);
			}
		} else {
			slug = generateSlug();
			while (await getUrl(slug, c.env)) {
				slug = generateSlug();
			}
		}

		// save the URL to KV
		await create(slug, data.url, c.env);

		// return the new URL
		return c.json(
			{
				slug,
				url: data.url,
				shortUrl: new URL(slug, c.env.HOST_URL).href,
			},
			StatusCodes.CREATED,
		);
	},
);

app.get("/:slug", async (c) => {
	// get slug from URL
	const slug = c.req.param("slug");

	// check if the slug exists
	const url = await getUrl(slug, c.env);
	if (!url) {
		return c.notFound();
	}

	return c.json({
		slug,
		url,
		hits: await getStats(slug, c.env),
	});
});

app.delete("/:slug", async (c) => {
	// get slug from URL
	const slug = c.req.param("slug");

	// check if the slug exists
	const url = await getUrl(slug, c.env);
	if (!url) {
		return c.notFound();
	}

	// delete the slug from KV
	await remove(slug, c.env);

	return c.json({ message: "Slug deleted" });
});

export default app;
