export interface Env {
	// KV bindings
	SHORT_URLS: KVNamespace;
	SHORT_URL_STATS: KVNamespace;

	// host URL
	AUTH_KEY: string;
	HOST_URL: string;
	HOMEPAGE_URL: string;
}

// cache TTL in seconds, 1 day
export const CACHE_TTL = 60 * 60 * 24;

export const STATISTICS_COUNTER = {
	TOTAL_HITS: "TOTAL_HITS",
	TOTAL_HIT_OK: "TOTAL_HIT_OK",
	TOTAL_HIT_ERROR: "TOTAL_HIT_ERROR",
};

export const AUTHORIZATION_SCHEME = "API-Key";

export const HTTP_STATUS_CODES = {
	OK: 200,
	CREATED: 201,
	PERMANENT_REDIRECT: 301,
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	NOT_FOUND: 404,
	CONFLICT: 409,
	INTERNAL_SERVER_ERROR: 500,
};
