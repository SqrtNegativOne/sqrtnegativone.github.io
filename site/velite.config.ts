import { defineConfig, s } from 'velite';

export default defineConfig({
  root: 'blog/posts',
  output: {
    data: 'src/lib/content',
    assets: 'static/velite',
    base: '/velite/',
    name: '[name]-[hash:6].[ext]',
    clean: true
  },
  collections: {
    posts: {
      name: 'Post',
      pattern: '*.md',
      schema: s
        .object({
          title: s.string(),
          date: s.isodate(),
          description: s.string().optional(),
          subtitle: s.string().optional(),
          tags: s.array(s.string()).default([]),
          font: s.string().optional(),
          draft: s.boolean().default(false),
          raw: s.raw(),
          content: s.markdown()
        })
        .transform((data, { meta }) => {
          return {
            ...data,
            slug: meta.basename?.replace(/\.md$/, '') || meta.path,
            rawSource: String(meta.value)
          };
        })
    }
  }
});
