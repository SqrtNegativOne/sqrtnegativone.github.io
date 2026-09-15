import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// This route needs the worker (D1), so it must not be prerendered.
export const prerender = false;

const MAX_BODY_LENGTH = 5000;
const RATE_LIMIT_WINDOW_MINUTES = 10;
const RATE_LIMIT_MAX = 5;

type Payload = {
	body?: unknown;
	/** Honeypot: real users never fill this in. */
	website?: unknown;
};

/** Fallback to `formData` so a no-JS `<form>` submission still works. */
async function readPayload(request: Request): Promise<Payload> {
	const type = request.headers.get('content-type') ?? '';

	if (type.includes('application/json')) {
		return (await request.json().catch(() => ({}))) as Payload;
	}

	if (type.includes('form')) {
		const form = await request.formData();
		return {
			body: form.get('body')?.toString(),
			website: form.get('website')?.toString()
		};
	}

	return {};
}

async function hashIp(ip: string): Promise<string> {
	// Rotate the salt daily so we never keep a stable identifier for a visitor.
	const salt = new Date().toISOString().slice(0, 10);
	const data = new TextEncoder().encode(`${ip}:${salt}`);
	const digest = await crypto.subtle.digest('SHA-256', data);
	return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const POST: RequestHandler = async ({ request, platform, getClientAddress }) => {
	const db = platform?.env.DB;

	if (!db) {
		return json({ ok: false, error: 'Database is not configured.' }, { status: 500 });
	}

	const payload = await readPayload(request);
	const isFormPost = !(request.headers.get('content-type') ?? '').includes('application/json');
	const text = typeof payload.body === 'string' ? payload.body.trim() : '';

	// Bots fill the hidden field: pretend it worked, store nothing.
	if (typeof payload.website === 'string' && payload.website.trim() !== '') {
		return isFormPost
			? new Response(null, { status: 303, headers: { location: '/contact?sent=1' } })
			: json({ ok: true });
	}

	if (text.length === 0) {
		return isFormPost
			? new Response(null, { status: 303, headers: { location: '/contact?error=empty' } })
			: json({ ok: false, error: 'Message is empty.' }, { status: 400 });
	}

	if (text.length > MAX_BODY_LENGTH) {
		return json(
			{ ok: false, error: `Message is too long (max ${MAX_BODY_LENGTH} characters).` },
			{ status: 413 }
		);
	}

	const ip = request.headers.get('cf-connecting-ip') ?? getClientAddress();
	const ipHash = ip ? await hashIp(ip) : null;

	if (ipHash) {
		const since = new Date(
			Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60_000
		).toISOString();

		const recent = await db
			.prepare('SELECT COUNT(*) AS count FROM messages WHERE ip_hash = ? AND created_at > ?')
			.bind(ipHash, since)
			.first<{ count: number }>();

		if ((recent?.count ?? 0) >= RATE_LIMIT_MAX) {
			return json(
				{ ok: false, error: 'Too many messages. Please try again later.' },
				{ status: 429 }
			);
		}
	}

	await db
		.prepare('INSERT INTO messages (body, ip_hash, country, user_agent) VALUES (?, ?, ?, ?)')
		.bind(
			text,
			ipHash,
			request.headers.get('cf-ipcountry'),
			request.headers.get('user-agent')?.slice(0, 512) ?? null
		)
		.run();

	if (isFormPost) {
		return new Response(null, { status: 303, headers: { location: '/contact?sent=1' } });
	}

	return json({ ok: true }, { status: 201 });
};
