// Uses CommonJS, not ESM, so no import export syntax.

// Imports
const pluginSitemap = require("@quasibit/eleventy-plugin-sitemap");
// const { eleventyImageTransformPlugin } = require("@11ty/eleventy-img"); Too buggy.
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const { feedPlugin } = require("@11ty/eleventy-plugin-rss");

// Configs
const configCss = require("./src/_config/css.js");
const configJs = require("./src/_config/javascript.js");
const configSitemap = require("./src/_config/sitemap.js");
const configServer = require("./src/_config/server.js");

// Other
const filterPostDate = require("./src/_config/postDate");
const isProduction = configServer.isProduction;

module.exports = function (eleventyConfig) {
    /**=====================================================================
          EXTENSIONS - Recognising non-default languages as templates 
    =======================================================================*/
    /** https://www.11ty.dev/docs/languages/custom/ */

    // This allows our minifier to read CSS files and minify them
    eleventyConfig.addTemplateFormats("css");
    eleventyConfig.addExtension("css", configCss);

    // Sets up JS files as an eleventy template language, which are compiled by esbuild. Allows bundling and minification of JS
    eleventyConfig.addTemplateFormats("js");
    eleventyConfig.addExtension("js", configJs);

    /**=====================================================================
                  PLUGINS - Adds additional eleventy functionality 
    =======================================================================*/
    /** https://www.11ty.dev/docs/plugins/ */

    eleventyConfig.addPlugin(pluginSitemap, configSitemap); // Generate a sitemap using the domain in _data/global.json
    //eleventyConfig.addPlugin(eleventyImageTransformPlugin); // Currently unused anywhere in the blog as of 2025-06-26, but can be used to transform images in templates. See https://www.11ty.dev/docs/plugins/image-transform/
    eleventyConfig.addPlugin(syntaxHighlight); // Also unused as of 2025-06-26. https://www.11ty.dev/docs/plugins/syntaxhighlight/
    eleventyConfig.addPlugin(feedPlugin, {
		type: "atom", // or "rss", "json"
		outputPath: "/blog/feed.xml",
		collection: {
			name: "posts", // iterate over `collections.posts`. Or should it be "post" because that's what I use in blog-index.html??
			limit: 10,     // 0 means no limit
		},
		metadata: {
			language: "en",
			title: "Sqrt-1's Blog",
			subtitle: "This is my blog.",
			base: "https://sqrtnegativone.github.io/",
			author: {
				name: "Sqrt-1",
				email: "", // Optional
			}
		}
    });

    /**======================================================================
       PASSTHROUGHS - Copy source files to /docs with no 11ty processing
    ========================================================================*/
    /** https://www.11ty.dev/docs/copy/ */

    eleventyConfig.addPassthroughCopy("./src/assets", {
        filter: ["**/*", "!**/*.js"], // JS files should be processed by esbuild so ignoring them here
        watch: true                   // Watch for changes in the assets folder
    });
    // eleventyConfig.addPassthroughCopy("./src/admin"); // kinda just... deleted this folder so
    eleventyConfig.addPassthroughCopy("./src/_redirects");

    /**======================================================================
               FILTERS - Modify data in template files at build time
    ========================================================================*/
    /** https://www.11ty.dev/docs/filters/ */

    /**
     *  Converts dates from JSDate format (Fri Dec 02 18:00:00 GMT-0600) to a locale format.
     *  Use - {{ "DATE GOES HERE" | postDate }}
     *  https://moment.github.io/luxon/api-docs/index.html#datetime
     */
    eleventyConfig.addFilter("postDate", filterPostDate);

    /**======================================================================
                  SHORTCODES - Output data using JS at build time
    ========================================================================*/
    /** https://www.11ty.dev/docs/shortcodes/ */

    /**
     *  Gets the current year, which can be outputted with {% year %}. Used for the footer copyright. Updates with every build.
     *  Use - {% year %}
     */
    eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

    /**=====================================================================
                                SERVER SETTINGS
    =======================================================================*/
    eleventyConfig.setServerOptions(configServer);

    return {
        dir: {
            input: "src", // Root folder is untidy enough...
            output: "docs", // Github Pages requires the output folder to be named docs
            includes: "_includes", // For reusable template partials or layouts; Eleventy knows to look in _includes when resolving paths in template commands like include.
            data: "_data", // For global and local data files (JSON, JS, YAML) that Eleventy uses to provide dynamic content to templates. Use case: Injects data into templates automatically.
        },
        markdownTemplateEngine: "njk", // Everyone uses it...
        htmlTemplateEngine: "njk"
    };
};
