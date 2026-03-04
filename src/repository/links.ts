export const CACHE_TTL = 60 * 60 * 24;

export function generateSlug() {
	return Math.random().toString(36).slice(2, 8);
}

export async function getUrl(slug: string, env: Env) {
	return env.SHORT_URLS.get(slug, { cacheTtl: CACHE_TTL });
}

export async function create(slug: string, url: string, env: Env) {
	await env.SHORT_URLS.put(slug, url);
}

export async function remove(slug: string, env: Env) {
	await env.SHORT_URLS.delete(slug);
}
