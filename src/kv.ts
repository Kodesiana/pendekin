import { CACHE_TTL, Env } from "./types";

export async function getUrl(slug: string, env: Env) {
	return env.SHORT_URLS.get(slug, { cacheTtl: CACHE_TTL });
}

export async function incrementStat(key: string, env: Env) {
	const lastHitCount = parseInt((await env.SHORT_URL_STATS.get(key)) || "0");
	await env.SHORT_URL_STATS.put(key, `${lastHitCount + 1}`);
}

export async function getStat(key: string, env: Env) {
	return parseInt((await env.SHORT_URL_STATS.get(key)) || "0");
}
