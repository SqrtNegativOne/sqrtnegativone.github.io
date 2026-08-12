import { json } from '@sveltejs/kit';
import * as cheerio from 'cheerio';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { url } = await request.json();

		if (!url) {
			return json({ error: 'URL is required' }, { status: 400 });
		}

		let quote = '';
		let source = '';

		// 1. Twitter / X
		if (url.includes('twitter.com/') || url.includes('x.com/')) {
			const match = url.match(/(?:twitter\.com|x\.com)\/([^/]+)\/status\/(\d+)/);
			if (match) {
				const [_, handle, id] = match;
				const res = await fetch(`https://api.fxtwitter.com/${handle}/status/${id}`);
				if (res.ok) {
					const data = await res.json();
					if (data.tweet) {
						quote = data.tweet.text;
						source = `${data.tweet.author.name} (@${data.tweet.author.screen_name})`;
					}
				}
			}
		} 
		// 2. Bluesky
		else if (url.includes('bsky.app/profile/')) {
			const match = url.match(/bsky\.app\/profile\/([^/]+)\/post\/([^/?#]+)/);
			if (match) {
				const [_, handle, id] = match;
				const profileRes = await fetch(`https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${handle}`);
				if (profileRes.ok) {
					const profile = await profileRes.json();
					const threadRes = await fetch(`https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=at://${profile.did}/app.bsky.feed.post/${id}`);
					if (threadRes.ok) {
						const threadData = await threadRes.json();
						if (threadData.thread?.post) {
							quote = threadData.thread.post.record.text;
							const author = threadData.thread.post.author;
							source = `${author.displayName || author.handle} (@${author.handle})`;
						}
					}
				}
			}
		} 
		// 3. Generic / Goodreads
		else {
			const res = await fetch(url, {
				headers: {
					'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
				}
			});
			if (res.ok) {
				const html = await res.text();
				const $ = cheerio.load(html);
				
				quote = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';
				let title = $('meta[property="og:title"]').attr('content') || $('title').text() || '';

				// Clean up Goodreads specific formatting
				if (url.includes('goodreads.com')) {
					// Title often looks like: "Quote by Author Name: “Quote text...”"
					const grMatch = title.match(/Quote by ([^:]+):/);
					if (grMatch) {
						source = grMatch[1];
					} else {
						source = title;
					}
					
					// Goodreads quote might have quotes around it, let's strip them
					if (quote.startsWith('“') && quote.endsWith('”')) {
						quote = quote.substring(1, quote.length - 1);
					}
				} else {
					source = title;
				}
			}
		}

		return json({ quote, source, link: url });

	} catch (error) {
		console.error('Error parsing quote URL:', error);
		return json({ error: 'Failed to parse URL' }, { status: 500 });
	}
};
