import { IRequest, json, html } from "itty-router";
import { z } from "zod";

import { Env, HTTP_STATUS_CODES, STATISTICS_COUNTER } from "./types";
import { getStat, getUrl, incrementStat } from "./kv";
import { notFoundPageContent } from "./html";
import { hashSlug } from "./helpers";

export function root(req: IRequest, env: Env) {
	return Response.redirect(env.HOMEPAGE_URL);
}

export function notFound(req: IRequest, env: Env) {
	return html(notFoundPageContent(), { status: HTTP_STATUS_CODES.NOT_FOUND });
}

const CreateSchema = z.object({
	slug: z.string().trim().optional(),
	url: z.string().url(),
});

export async function create(req: IRequest, env: Env) {
	// load data
	const parsed = CreateSchema.safeParse(req.content);
	if (!parsed.success) {
		return json(
			{ message: "Invalid request", error: parsed.error },
			{ status: HTTP_STATUS_CODES.BAD_REQUEST }
		);
	}

	// get the data
	const data = parsed.data;

	// check if the slug already exists
	if (data.slug) {
		const url = await getUrl(data.slug, env);
		if (url) {
			return json(
				{ message: "Slug already exists" },
				{ status: HTTP_STATUS_CODES.CONFLICT }
			);
		}
	}

	// generate a slug if one doesn't exist
	let slug = data.slug || Math.random().toString(36).slice(2, 8);

	// check if the slug is available
	while (await getUrl(slug, env)) {
		slug = Math.random().toString(36).slice(2, 8);
	}

	// save the URL to KV
	await env.SHORT_URLS.put(slug, data.url);
	await env.SHORT_URL_STATS.put(await hashSlug(slug), "0");

	// return the new URL
	const shortUrl = new URL(slug, env.HOST_URL).toString();
	return json({ slug, url: data.url, shortUrl: shortUrl }, { status: HTTP_STATUS_CODES.CREATED });
}

export async function detail(req: IRequest, env: Env) {
	// get slug from URL
	const slug = req.params.slug;

	// check if the slug exists
	const url = await getUrl(slug, env);
	if (!url) {
		return json(
			{ message: "Slug not found" },
			{ status: HTTP_STATUS_CODES.NOT_FOUND }
		);
	}

	return json({
		slug,
		url,
		hits: await getStat(await hashSlug(slug), env),
	});
}

export async function remove(req: IRequest, env: Env) {
	// get slug from URL
	const slug = req.params.slug;

	// check if the slug exists
	const url = await getUrl(slug, env);
	if (!url) {
		return json(
			{ message: "Slug not found" },
			{ status: HTTP_STATUS_CODES.NOT_FOUND }
		);
	}

	// delete the slug from KV
	await env.SHORT_URLS.delete(slug);
	await env.SHORT_URL_STATS.delete(await hashSlug(slug));

	return json({ message: "Slug deleted" });
}

const ListSchema = z.object({
	prefix: z.string().trim().optional(),
	size: z.coerce.number().min(1).max(100).default(10),
	cursor: z.string().optional(),
});

export async function list(req: IRequest, env: Env) {
	// parse query params
	const parsed = ListSchema.safeParse(req.query);
	if (!parsed.success) {
		return json(
			{ message: "Invalid request", error: parsed.error },
			{ status: HTTP_STATUS_CODES.BAD_REQUEST }
		);
	}

	// get the data
	const data = parsed.data;

	// get the list of keys
	const slugs = await env.SHORT_URLS.list({
		prefix: data.prefix,
		limit: data.size,
		cursor: data.cursor,
	});

	if (slugs.keys.length === 0) {
		return json(
			{ message: "No slugs found" },
			{ status: HTTP_STATUS_CODES.NOT_FOUND }
		);
	}

	// get the stats
	const stats = await Promise.all(
		slugs.keys.map(async (key) => {
			return {
				slug: key.name,
				url: await getUrl(key.name, env),
				hits: await getStat(await hashSlug(key.name), env),
			};
		})
	);

	// return the list of slugs
	return json({
		// @ts-ignore
		cursor: slugs.cursor,
		isComplete: slugs.list_complete,
		data: stats,
	});
}

export async function redirect(req: IRequest, env: Env) {
	// get slug from URL
	const slug = req.params.slug;
	await incrementStat(STATISTICS_COUNTER.TOTAL_HITS, env);

	// get the URL from KV
	const url = await getUrl(slug, env);

	// if the URL exists, redirect to it
	if (url) {
		// save the hit to KV
		await incrementStat(await hashSlug(slug), env);
		await incrementStat(STATISTICS_COUNTER.TOTAL_HIT_OK, env);

		// return a 301 redirect
		return Response.redirect(url, HTTP_STATUS_CODES.PERMANENT_REDIRECT);
	}

	// save error hit stats
	await incrementStat(STATISTICS_COUNTER.TOTAL_HIT_ERROR, env);

	// otherwise, return a 404
	return html(notFoundPageContent(), { status: HTTP_STATUS_CODES.NOT_FOUND });
}

export async function statistics(req: IRequest, env: Env) {
	return json({
		hits: await getStat(STATISTICS_COUNTER.TOTAL_HITS, env),
		success: await getStat(STATISTICS_COUNTER.TOTAL_HIT_OK, env),
		error: await getStat(STATISTICS_COUNTER.TOTAL_HIT_ERROR, env),
	});
}
