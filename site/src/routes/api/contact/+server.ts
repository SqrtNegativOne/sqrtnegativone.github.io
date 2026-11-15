import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { contactMethodIds, type ContactMethodId } from '$shared/data/contactMethods';

// This route needs the worker (D1), so it must not be prerendered.
export const prerender = false;

const MAX_BODY_LENGTH = 5000;
const MAX_HANDLE_LENGTH = 200;
const RATE_LIMIT_WINDOW_MINUTES = 10;
const RATE_LIMIT_MAX = 5;

const ALLOWED_METHODS = new Set<string>(contactMethodIds);

type Payload = {
	body?: unknown;
	/** Optional reply channel: `whatsapp`, `email`, `discord`, … */
	contact_method?: unknown;
	/** Optional handle/address on that channel. */
	contact_handle?: unknown;
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
			contact_method: form.get('contact_method')?.toString(),
			contact_handle: form.get('contact_handle')?.toString(),
			website: form.get('website')?.toString()
		};
	}

	return {};
}

/** `RESEND_API_KEY` is a Wrangler secret, so it is not in the generated Env type. */
type ContactEnv = App.Platform['env'] & { RESEND_API_KEY?: string };

type NotificationDetails = {
	body: string;
	country: string | null;
	method: ContactMethodId | null;
	handle: string | null;
	userAgent: string | null;
};

/**
 * Send a best-effort email notification through Resend.
 *
 * The message is already stored in D1 before this runs, so a Resend outage
 * must never fail the submission. Missing configuration is ignored.
 */
async function notifyNewMessage(env: ContactEnv, details: NotificationDetails): Promise<void> {
	const apiKey = env.RESEND_API_KEY;
	const to = env.CONTACT_NOTIFY_EMAIL;

	if (!apiKey || !to) {
		console.warn('Contact notification skipped: RESEND_API_KEY or CONTACT_NOTIFY_EMAIL is not set.');
		return;
	}

	const lines = [
		details.body,
		'',
		'---',
		`Country: ${details.country ?? 'unknown'}`,
		details.method
			? `Reply via: ${details.method}${details.handle ? ` (${details.handle})` : ''}`
			: 'Reply details: none',
		details.userAgent ? `User agent: ${details.userAgent}` : null
	].filter((line): line is string => line !== null);

	const response = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			from: `sqrt.fyi <${env.CONTACT_NOTIFY_FROM || 'onboarding@resend.dev'}>`,
			to: [to],
			subject: `New sqrt.fyi message${details.country ? ` (${details.country})` : ''}`,
			text: lines.join('\n')
		}),
		signal: AbortSignal.timeout(10_000)
	});

	if (!response.ok) {
		console.error(
			'Resend rejected the contact notification:',
			response.status,
			await response.text()
		);
	}
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

	// Reply details are optional: keep only a known method and a bounded handle.
	const rawMethod = typeof payload.contact_method === 'string' ? payload.contact_method.trim() : '';
	const contactMethod = ALLOWED_METHODS.has(rawMethod) ? (rawMethod as ContactMethodId) : null;
	const rawHandle = typeof payload.contact_handle === 'string' ? payload.contact_handle.trim() : '';

	if (rawHandle.length > MAX_HANDLE_LENGTH) {
		return json(
			{
				ok: false,
				error: `Contact details are too long (max ${MAX_HANDLE_LENGTH} characters).`
			},
			{ status: 413 }
		);
	}

	const contactHandle = rawHandle.length > 0 ? rawHandle : null;

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

	const country = request.headers.get('cf-ipcountry');
	const userAgent = request.headers.get('user-agent')?.slice(0, 512) ?? null;

	await db
		.prepare(
			'INSERT INTO messages (body, ip_hash, country, user_agent, contact_method, contact_handle) VALUES (?, ?, ?, ?, ?, ?)'
		)
		.bind(
			text,
			ipHash,
			country,
			userAgent,
			contactHandle ? contactMethod : null,
			contactHandle
		)
		.run();

	// Fire-and-forget so a slow or failing email never delays the form response.
	if (platform?.ctx) {
		platform.ctx.waitUntil(
			notifyNewMessage(platform.env, {
				body: text,
				country,
				method: contactMethod,
				handle: contactHandle,
				userAgent
			}).catch((error) => console.error('Contact notification failed:', error))
		);
	}

	if (isFormPost) {
		return new Response(null, { status: 303, headers: { location: '/contact?sent=1' } });
	}

	return json({ ok: true }, { status: 201 });
};
