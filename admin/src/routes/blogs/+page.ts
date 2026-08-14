import { invoke } from '@tauri-apps/api/core';
import type { PageLoad } from './$types';
import { getRepoRoot } from '$lib/db';

interface BlogItem {
  id: string;
  title: string;
  date: string;
  description: string;
  content: string;
  tags?: string[];
  font?: string;
}

function parseMarkdown(rawContent: string, filename: string): BlogItem {
  const match = rawContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  let title = '', date = '', description = '', body = rawContent;
  if (match) {
    const frontmatter = match[1];
    body = match[2];
    const titleMatch = frontmatter.match(/title:\s*"(.*?)"/);
    if (titleMatch) title = titleMatch[1];
    const dateMatch = frontmatter.match(/date:\s*(.*?)(?:\r?\n|$)/);
    if (dateMatch) date = dateMatch[1];
    const descMatch = frontmatter.match(/description:\s*"(.*?)"/);
    if (descMatch) description = descMatch[1];
    const tagsMatch = frontmatter.match(/tags:\s*\[?(.*?)\]?(?:\r?\n|$)/);
    let tags: string[] = [];
    if (tagsMatch) {
       tags = tagsMatch[1].split(',').map(t => t.replace(/"/g, '').trim()).filter(Boolean);
    }
    const fontMatch = frontmatter.match(/font:\s*"(.*?)"/);
    const font = fontMatch ? fontMatch[1] : 'IBM Plex Sans';
    return { id: filename, title, date, description, content: body.trim(), tags, font };
  }
  return { id: filename, title, date, description, content: body.trim(), tags: [], font: 'IBM Plex Sans' };
}

import { ResultAsync } from 'neverthrow';

export const load: PageLoad = async () => {
  const rootRes = await ResultAsync.fromPromise(getRepoRoot(), e => e);
  if (rootRes.isErr()) {
    console.error('Failed to get repo root:', rootRes.error);
    return { posts: [] };
  }
  
  const root = rootRes.value;
  const blogDir = `${root}/blog/posts`;
  const fontsPath = `${root}/blog/_data/fonts.json`;

  let fonts = [];
  const fontsContentRes = await ResultAsync.fromPromise(invoke<string>('read_file', { path: fontsPath }), e => e);
  if (fontsContentRes.isOk()) {
    try {
      fonts = JSON.parse(fontsContentRes.value);
    } catch (e) {
      console.error('Failed to parse fonts.json:', e);
    }
  }
  
  const filesRes = await ResultAsync.fromPromise(invoke<string[]>('read_dir', { path: blogDir }), e => e);
  if (filesRes.isErr()) {
    console.error('Failed to read posts dir:', filesRes.error);
    return { posts: [], fonts };
  }
  
  const files = filesRes.value;
  const posts: BlogItem[] = [];
  
  for (const filename of files) {
    if (typeof filename === 'string' && filename.endsWith('.md')) {
      const filePath = `${blogDir}/${filename}`;
      const contentRes = await ResultAsync.fromPromise(invoke<string>('read_file', { path: filePath }), e => e);
      if (contentRes.isOk()) {
        let parsed = parseMarkdown(contentRes.value, filename);
        if (!parsed.tags || parsed.tags.length === 0) parsed.tags = ['post'];
        posts.push(parsed);
      } else {
        console.error(`Failed to read ${filename}:`, contentRes.error);
      }
    }
  }
  
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  return { posts, fonts };
};
