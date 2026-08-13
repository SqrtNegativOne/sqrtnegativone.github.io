import { invoke } from '@tauri-apps/api/core';
import type { PageLoad } from './$types';
import { getRepoRoot } from '$lib/db';

interface BlogItem {
  id: string;
  title: string;
  date: string;
  description: string;
  content: string;
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
  }
  return { id: filename, title, date, description, content: body.trim() };
}

export const load: PageLoad = async () => {
  try {
    const root = await getRepoRoot();
    const blogDir = `${root}/blog/posts`;
    const files = await invoke<any[]>('read_dir', { path: blogDir });
    
    const posts: BlogItem[] = [];
    for (const fileObj of files) {
      if (fileObj.name && fileObj.name.endsWith('.md')) {
        const filePath = `${blogDir}/${fileObj.name}`;
        try {
          const content = await invoke<string>('read_file', { path: filePath });
          posts.push(parseMarkdown(content, fileObj.name));
        } catch (e) {
          console.error(`Failed to read ${fileObj.name}:`, e);
        }
      }
    }
    
    posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return { posts };
  } catch (e) {
    console.error('Failed to load blog posts:', e);
    return { posts: [] };
  }
};
