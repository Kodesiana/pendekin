# Pendekin

This is a simple link shortener service using CloudFlare Workers and KV. The idea is simple, create short URLs and collect how many of the URLs are visited.

Postman documentation: [here](./pendekin.postman_collection.json)

Features:

1. Basic authentication using API key
2. Create/delete/get short URL detail and hit count
3. Get total hits, total success and failed hits

## Deployment

1. Clone this repo
2. Login using `wrangler login`
3. Create two KV namespace `npx wrangler kv:namespace create SHORT_URLS` and `SHORT_URL_STATS`
4. Copy the binding code to the `wrangler.toml`, replace the old value there
5. Update the `HOST_URL` to your main site (this is the default redirect)
6. Create `.dev.vars` and add this line: `AUTH_KEY=<random key here>`
7. Deploy the worker `npm run deploy`

Easy peasy, right?
