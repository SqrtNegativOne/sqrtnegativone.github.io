import fs from 'node:fs/promises';
import path from 'node:path';
import { fail } from '@sveltejs/kit';
import { ResultAsync } from 'neverthrow';
import type { PageServerLoad, Actions } from './$types';

interface BlogItem {
  id: string;
  title: string;
  date: string;
  description: string;
  content: string;
}

const blogDir = path.join(process.cwd(), '..', 'blog', 'posts');

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

function createMarkdown(title: string, date: string, description: string, content: string) {
  return `---
title: "${title}"
date: ${date}
description: "${description}"
---

${content}
`;
}

export const load: PageServerLoad = async () => {
  const filesRes = await ResultAsync.fromPromise(fs.readdir(blogDir), e => e as Error);
  const files = filesRes.unwrapOr([] as string[]);
  
  const posts: BlogItem[] = [];
  for (const file of files) {
    if (file.endsWith('.md')) {
      const contentRes = await ResultAsync.fromPromise(fs.readFile(path.join(blogDir, file), 'utf-8'), e => e);
      if (contentRes.isOk()) {
        posts.push(parseMarkdown(contentRes.value, file));
      }
    }
  }
  
  // sort by date descending
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  return { posts };
};

export const actions: Actions = {
  save: async ({ request }) => {
    const data = await request.formData();
    let id = data.get('id') as string;
    const title = data.get('title') as string;
    const date = data.get('date') as string;
    const description = data.get('description') as string;
    const content = data.get('content') as string;
    const isNew = data.get('isNew') === 'true';
    
    if (!id || !title || !date) {
      return fail(400, { error: 'ID, Title, and Date are required' });
    }
    
    if (!id.endsWith('.md')) id += '.md';
    
    const filepath = path.join(blogDir, id);
    
    if (isNew) {
      const existsRes = await ResultAsync.fromPromise(fs.access(filepath), e => e);
      if (existsRes.isOk()) {
        return fail(400, { error: 'Blog post ID already exists' });
      }
    }
    
    const fileContent = createMarkdown(title, date, description, content);
    const writeRes = await ResultAsync.fromPromise(fs.writeFile(filepath, fileContent, 'utf-8'), e => e);
    if (writeRes.isErr()) {
      return fail(500, { error: 'Failed to save blog post' });
    }
    
    return { success: true };
  },
  
  delete: async ({ request }) => {
    const data = await request.formData();
    const id = data.get('id') as string;
    
    if (!id) return fail(400, { error: 'ID is required' });
    
    const filepath = path.join(blogDir, id);
    const deleteRes = await ResultAsync.fromPromise(fs.unlink(filepath), e => e);
    if (deleteRes.isErr()) {
      return fail(400, { error: 'Could not delete file' });
    }
    
    return { success: true };
  }
};
