export async function hashSlug(slug: string): Promise<string> {
	const encoder = new TextEncoder().encode(slug);
	const hash = await crypto.subtle.digest("SHA-256", encoder);
	const hashArray = Array.from(new Uint8Array(hash));
	const hashHex = hashArray
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");

	return hashHex;
}
