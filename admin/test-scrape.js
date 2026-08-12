async function test() {
  // Goodreads
  let res = await fetch('https://www.goodreads.com/quotes/8630', { headers: {'User-Agent': 'Mozilla/5.0'} });
  let text = await res.text();
  console.log('Goodreads og:description:', text.match(/<meta property="og:description" content="([^"]+)"/)?.[1]);
  console.log('Goodreads og:title:', text.match(/<meta property="og:title" content="([^"]+)"/)?.[1]);
  
  // Twitter
  res = await fetch('https://api.vxtwitter.com/X/status/1701314647348981881');
  let json = await res.json().catch(()=>null);
  console.log('Twitter:', json?.text?.substring(0,50), json?.user_name);
  
  // Bluesky
  // resolve handle to did
  res = await fetch('https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=jay.bsky.team');
  let profile = await res.json();
  res = await fetch('https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=at://' + profile.did + '/app.bsky.feed.post/3kqj4326ybc2o');
  let thread = await res.json();
  console.log('Bluesky:', thread.thread.post.record.text.substring(0,50), thread.thread.post.author.handle);
}
test();
