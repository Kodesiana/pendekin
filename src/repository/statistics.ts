// special slug for statistics
export const SLUG_KEYS = {
	TOTAL_HITS: "TOTAL_HITS",
	TOTAL_HIT_OK: "TOTAL_HIT_OK",
	TOTAL_HIT_ERROR: "TOTAL_HIT_ERROR",
};

export async function incrementSlugHit(slug: string, env: Env) {
	const lastHit = await env.SHORT_URL_STATS.get(slug);
	const lastHitCount = Number.parseInt(lastHit || "0");

	await env.SHORT_URL_STATS.put(slug, `${lastHitCount + 1}`);
}

export async function incrementTotalOkHits(env: Env) {
	await incrementSlugHit(SLUG_KEYS.TOTAL_HITS, env);
	await incrementSlugHit(SLUG_KEYS.TOTAL_HIT_OK, env);
}

export async function incrementTotalErrorHits(env: Env) {
	await incrementSlugHit(SLUG_KEYS.TOTAL_HITS, env);
	await incrementSlugHit(SLUG_KEYS.TOTAL_HIT_ERROR, env);
}

export async function getStats(slug: string, env: Env) {
	const val = await env.SHORT_URL_STATS.get(slug);
	return Number.parseInt(val || "0");
}

export async function getSummaryStats(env: Env) {
	return {
		hits: await getStats(SLUG_KEYS.TOTAL_HITS, env),
		success: await getStats(SLUG_KEYS.TOTAL_HIT_OK, env),
		error: await getStats(SLUG_KEYS.TOTAL_HIT_ERROR, env),
	};
}
