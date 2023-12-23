import { Env } from "./types";

export async function hashSlug(slug: string): Promise<string> {
	const encoder = new TextEncoder().encode(slug);
	const hash = await crypto.subtle.digest("SHA-256", encoder);
	const hashArray = Array.from(new Uint8Array(hash));
	const hashHex = hashArray
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");

	return hashHex;
}

export async function incrementStat(key: string, env: Env) {
	const lastHitCount = parseInt((await env.SHORT_URL_STATS.get(key)) || "0");
	await env.SHORT_URL_STATS.put(key, `${lastHitCount + 1}`);
}

export async function getStat(key: string, env: Env) {
	return parseInt((await env.SHORT_URL_STATS.get(key)) || "0");
}
