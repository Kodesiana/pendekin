// Generated by Wrangler by running `wrangler types`

interface Env {
	// KV bindings
	SHORT_URLS: KVNamespace;
	SHORT_URL_STATS: KVNamespace;

	// host URL
	AUTH_KEY: string;
	HOST_URL: string;
	HOMEPAGE_URL: string;
}
