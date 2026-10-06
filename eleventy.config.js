// Eleventy settings for the Gem Boys State website.
// Volunteers don't need to edit this file. See README.md instead.

import { HtmlBasePlugin, IdAttributePlugin } from "@11ty/eleventy";
import yaml from "js-yaml";
import { md } from "./lib/markdown.js";
import { registerShortcodes } from "./lib/shortcodes.js";
import { highlightTodos } from "./lib/transforms.js";

export default function (eleventyConfig) {
	eleventyConfig.setLibrary("md", md);
	eleventyConfig.addDataExtension("yaml,yml", (contents) => yaml.load(contents));

	// Rebuild the preview when the yearly details or site code change.
	eleventyConfig.addWatchTarget("./site-details.yaml");
	eleventyConfig.addWatchTarget("./lib/");

	// Makes links work both at a github.io address (which adds the repository
	// name to every URL) and at the final domain.
	eleventyConfig.addPlugin(HtmlBasePlugin);
	// Gives every heading an id, so links like /how-to-attend/#for-parents work.
	eleventyConfig.addPlugin(IdAttributePlugin);

	// The help notes inside the upload folders are for GitHub, not the website.
	eleventyConfig.ignores.add("src/documents/**/*.md");
	eleventyConfig.ignores.add("src/images/**/*.md");

	eleventyConfig.addPassthroughCopy({ "src/assets": "assets", "src/static": "/" });
	eleventyConfig.addPassthroughCopy("src/documents/**/*.{pdf,doc,docx,xls,xlsx,ppt,pptx}");
	eleventyConfig.addPassthroughCopy("src/images/**/*.{jpg,jpeg,png,webp,avif,gif,svg}");

	registerShortcodes(eleventyConfig);

	eleventyConfig.addFilter("mdInline", (text) => md.renderInline(String(text ?? "")));

	eleventyConfig.addTransform("highlight-todos", function (content) {
		return (this.page.outputPath || "").endsWith(".html") ? highlightTodos(content) : content;
	});

	return {
		dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
		templateFormats: ["md", "njk", "11ty.js"],
		markdownTemplateEngine: "njk",
		htmlTemplateEngine: "njk",
		// Set automatically by the GitHub publishing workflow.
		pathPrefix: process.env.PATH_PREFIX || "/",
	};
}
