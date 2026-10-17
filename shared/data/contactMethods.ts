/**
 * Reply-channel options for the contact form.
 *
 * Shared by the site (`site/src/routes/contact`) and the admin messages view so
 * an icon/label never disagrees with the value stored in D1.
 */
export type ContactMethodId =
	| 'email'
	| 'whatsapp'
	| 'phone'
	| 'sms'
	| 'discord'
	| 'linkedin'
	| 'steam';

export interface ContactMethod {
	id: ContactMethodId;
	label: string;
	/** Placeholder shown in the handle field while this method is selected. */
	placeholder: string;
	/** `viewBox` for the `icon` markup. */
	viewBox: string;
	/** Inline SVG children (monochrome, uses `currentColor`). */
	icon: string;
	/** Keyboard hint for the handle field. */
	inputMode: 'text' | 'email' | 'tel' | 'url';
	/** Build a clickable link from a handle, or `null` when it can't be linked. */
	href: (handle: string) => string | null;
}

const digits = (value: string) => value.replace(/\D/g, '');

const asUrl = (value: string) => (/^https?:\/\//i.test(value) ? value : null);

export const contactMethods: ContactMethod[] = [
	{
		id: 'email',
		label: 'Email',
		placeholder: 'you@example.com so I can reply',
		viewBox: '2 4 20 16',
		icon: '<path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />',
		inputMode: 'email',
		href: (handle) => (handle.includes('@') ? `mailto:${handle}` : null)
	},
	{
		id: 'whatsapp',
		label: 'WhatsApp',
		placeholder: 'number with country code, e.g. +1 555 010 0199',
		viewBox: '0 0 24 24',
		icon: '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />',
		inputMode: 'tel',
		href: (handle) => {
			const number = digits(handle);
			return number.length >= 7 ? `https://wa.me/${number}` : null;
		}
	},
	{
		id: 'phone',
		label: 'Phone',
		placeholder: 'number with country code, e.g. +1 555 010 0199',
		viewBox: '0 0 24 24',
		icon: '<path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />',
		inputMode: 'tel',
		href: (handle) => {
			const number = handle.replace(/[^\d+]/g, '');
			return digits(number).length >= 7 ? `tel:${number}` : null;
		}
	},
	{
		id: 'sms',
		label: 'SMS',
		placeholder: 'number to text, e.g. +1 555 010 0199',
		viewBox: '0 0 24 24',
		icon: '<path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 11H7V9h2v2zm4 0h-2V9h2v2zm4 0h-2V9h2v2z" />',
		inputMode: 'tel',
		href: (handle) => {
			const number = handle.replace(/[^\d+]/g, '');
			return digits(number).length >= 7 ? `sms:${number}` : null;
		}
	},
	{
		id: 'discord',
		label: 'Discord',
		placeholder: 'username, e.g. sqrt_1',
		viewBox: '0 0 24 24',
		icon: '<path d="M20.317 4.3698a19.7913 19.7913 0 0 0-4.8851-1.5152.0741.0741 0 0 0-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 0 0-.0785-.037 19.7363 19.7363 0 0 0-4.8852 1.515.0699.0699 0 0 0-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 0 0 .0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 0 0 .0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 0 0-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 0 1-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 0 1 .0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 0 1 .0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 0 1-.0066.1276 12.2986 12.2986 0 0 1-1.873.8914.0766.0766 0 0 0-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 0 0 .0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 0 0 .0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 0 0-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />',
		inputMode: 'text',
		href: () => null
	},
	{
		id: 'linkedin',
		label: 'LinkedIn',
		placeholder: 'profile URL or your name',
		viewBox: '0 0 24 24',
		icon: '<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.063 2.063 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />',
		inputMode: 'text',
		href: (handle) =>
			asUrl(handle) ?? `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(handle)}`
	},
	{
		id: 'steam',
		label: 'Steam',
		placeholder: 'profile URL, custom URL, or SteamID64',
		viewBox: '0 0 24 24',
		icon: '<path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.454 1.012H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.253 0-2.265-1.014-2.265-2.265z" />',
		inputMode: 'text',
		href: (handle) => {
			const url = asUrl(handle);
			if (url) return url;
			if (/^\d{17}$/.test(handle)) return `https://steamcommunity.com/profiles/${handle}`;
			return `https://steamcommunity.com/id/${encodeURIComponent(handle)}`;
		}
	}
];

export const contactMethodIds = contactMethods.map((method) => method.id);

const byId = new Map(contactMethods.map((method) => [method.id, method]));

/** Look up a method by its stored id (tolerates legacy/unknown values). */
export function getContactMethod(id: string | null | undefined): ContactMethod | null {
	if (!id) return null;
	return byId.get(id as ContactMethodId) ?? null;
}

/** No account needed: the first method is the form default. */
export const defaultContactMethodId: ContactMethodId = contactMethods[0].id;
