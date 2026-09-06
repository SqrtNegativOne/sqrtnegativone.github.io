import { ResultAsync, okAsync, errAsync } from 'neverthrow';
import { safeInvoke, safeJsonParse } from '$lib/utils';

export interface ExtractedQuote {
  quote: string;
  source: string;
}

export interface QuoteProvider {
  readonly name: string;
  canHandle(url: URL): boolean;
  fetch(url: URL): ResultAsync<ExtractedQuote, Error>;
}

interface FxTwitterResponse {
  tweet?: {
    text?: string;
    author?: {
      name?: string;
      screen_name?: string;
    };
  };
}

interface BskyProfileResponse {
  did?: string;
  handle?: string;
  displayName?: string;
}

interface BskyThreadResponse {
  thread?: {
    post?: {
      record?: {
        text?: string;
      };
      author?: {
        handle?: string;
        displayName?: string;
      };
    };
  };
}

export class TwitterQuoteProvider implements QuoteProvider {
  readonly name = 'Twitter / X';

  private static readonly DOMAINS = new Set([
    'twitter.com',
    'x.com',
    'vxtwitter.com',
    'fxtwitter.com',
    'fixupx.com',
    'fixvx.com',
    'twittpr.com'
  ]);

  canHandle(url: URL): boolean {
    const domain = url.hostname.replace(/^www\./, '');
    return TwitterQuoteProvider.DOMAINS.has(domain) || /^\/[^/]+\/status\/\d+/.test(url.pathname);
  }

  fetch(url: URL): ResultAsync<ExtractedQuote, Error> {
    const match = url.pathname.match(/^\/([^/]+)\/status\/(\d+)/);
    if (!match) {
      return errAsync(new Error('Invalid Twitter/X URL format. Expected a link to a specific post.'));
    }
    const [, handle, id] = match;

    return safeInvoke<string>('fetch_url', { url: `https://api.fxtwitter.com/${handle}/status/${id}` })
      .andThen(safeJsonParse)
      .andThen((data: unknown) => {
        const res = data as FxTwitterResponse;
        if (!res.tweet?.text || !res.tweet?.author) {
          return errAsync(new Error('Could not find tweet data.'));
        }
        return okAsync({
          quote: res.tweet.text,
          source: `${res.tweet.author.name} (@${res.tweet.author.screen_name})`
        });
      });
  }
}

export class BlueskyQuoteProvider implements QuoteProvider {
  readonly name = 'Bluesky';

  private static readonly DOMAINS = new Set([
    'bsky.app',
    'bsky.social',
    'anisota.net',
    'deck.blue',
    'tokimeki.blue',
    'skyview.social',
    'blacksky.app',
    'bluesky.app'
  ]);

  canHandle(url: URL): boolean {
    const domain = url.hostname.replace(/^www\./, '');
    return BlueskyQuoteProvider.DOMAINS.has(domain) || /^\/profile\/[^/]+\/post\/[^/?#]+/.test(url.pathname);
  }

  fetch(url: URL): ResultAsync<ExtractedQuote, Error> {
    const match = url.pathname.match(/^\/profile\/([^/]+)\/post\/([^/?#]+)/);
    if (!match) {
      return errAsync(new Error('Invalid Bluesky URL format. Expected a link to a specific post.'));
    }
    const [, handle, id] = match;

    return safeInvoke<string>('fetch_url', {
      url: `https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${encodeURIComponent(handle)}`
    })
      .andThen(safeJsonParse)
      .andThen((profileData: unknown) => {
        const profile = profileData as BskyProfileResponse;
        if (!profile.did) {
          return errAsync(new Error('Could not find Bluesky user profile.'));
        }
        return safeInvoke<string>('fetch_url', {
          url: `https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=at://${profile.did}/app.bsky.feed.post/${id}`
        });
      })
      .andThen(safeJsonParse)
      .andThen((threadData: unknown) => {
        const thread = threadData as BskyThreadResponse;
        const post = thread.thread?.post;
        if (!post?.record?.text || !post?.author) {
          return errAsync(new Error('Could not find Bluesky post.'));
        }
        const author = post.author;
        return okAsync({
          quote: post.record.text,
          source: `${author.displayName || author.handle} (@${author.handle})`
        });
      });
  }
}

export class GoodreadsQuoteProvider implements QuoteProvider {
  readonly name = 'Goodreads';

  canHandle(url: URL): boolean {
    const domain = url.hostname.replace(/^www\./, '');
    return domain === 'goodreads.com';
  }

  fetch(url: URL): ResultAsync<ExtractedQuote, Error> {
    return safeInvoke<string>('fetch_url', { url: url.toString() }).map((html) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      const ogDesc = doc.querySelector('meta[property="og:description"]')?.getAttribute('content');
      const nameDesc = doc.querySelector('meta[name="description"]')?.getAttribute('content');
      let quote = ogDesc || nameDesc || '';

      const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content');
      const titleText = doc.querySelector('title')?.textContent || '';
      const title = ogTitle || titleText;

      let source = title;
      const grMatch = title.match(/Quote by ([^:]+):/);
      if (grMatch) {
        source = grMatch[1];
      }

      if (quote.startsWith('“') && quote.endsWith('”')) {
        quote = quote.substring(1, quote.length - 1);
      }

      return { quote, source };
    });
  }
}

export const quoteProviders: QuoteProvider[] = [
  new TwitterQuoteProvider(),
  new BlueskyQuoteProvider(),
  new GoodreadsQuoteProvider()
];

export function findQuoteProvider(url: URL): QuoteProvider | undefined {
  return quoteProviders.find((provider) => provider.canHandle(url));
}
