import markdownIt from "markdown-it";
import markdownItFootnote from "markdown-it-footnote";
import pluginRss from "@11ty/eleventy-plugin-rss";
import { readFileSync } from "node:fs";

export default function (eleventyConfig) {
  // Atom/RSS helpers (dateToRfc3339, absoluteUrl, etc.)
  eleventyConfig.addPlugin(pluginRss);

  // Markdown with footnote support
  const md = markdownIt({ html: true, linkify: true, typographer: true });
  md.use(markdownItFootnote);
  eleventyConfig.setLibrary("md", md);

  // Pass through any static assets inside blog/
  eleventyConfig.addPassthroughCopy({ "blog/assets": "assets" });

  // Collection: published posts (sorted newest first)
  eleventyConfig.addCollection("posts", (collectionApi) =>
    collectionApi
      .getFilteredByTag("post")
      .filter((p) => !p.data.tags.includes("afterdark"))
      .filter((p) => !p.data.draft)
      .sort((a, b) => b.date - a.date)
  );

  // Collection: afterdark / draft posts
  eleventyConfig.addCollection("afterdark", (collectionApi) =>
    collectionApi
      .getFilteredByTag("afterdark")
      .sort((a, b) => b.date - a.date)
  );

  // Human-readable date filter
  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return new Date(dateObj).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  // ISO 8601 date filter for sitemap
  eleventyConfig.addFilter("isoDate", (dateObj) => {
    return new Date(dateObj).toISOString().split("T")[0];
  });

  // JSON.stringify with <, >, & escaped so output is safe inside <script> tags
  eleventyConfig.addFilter("json", (value) => {
    return JSON.stringify(value)
      .replaceAll("<", "\\u003c")
      .replaceAll(">", "\\u003e")
      .replaceAll("&", "\\u0026");
  });

  // Raw markdown source of a post (for per-page markdown endpoints)
  eleventyConfig.addFilter("readSource", (post) => {
    return readFileSync(post.inputPath, "utf8");
  });

  return {
    dir: {
      input: "blog",
      output: "static",
      includes: "_includes",
    },
  };
}
