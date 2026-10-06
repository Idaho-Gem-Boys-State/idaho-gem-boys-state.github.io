import markdownIt from "markdown-it";

// One shared Markdown renderer for pages and shortcodes.
// typographer turns "quotes" and -- into proper punctuation;
// linkify turns plain web and email addresses into links.
export const md = markdownIt({ html: true, linkify: true, typographer: true });
