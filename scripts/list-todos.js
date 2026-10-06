// Lists every piece of missing information in the site:
//   1. "TODO" notes in site-details.yaml (not shown on the website)
//   2. [TODO: ...] placeholders that appear on the website, page by page
//
// Run with:        npm run todo
// Save a copy to docs/TODO.md with:   npm run todo -- --write

import fs from "node:fs";
import path from "node:path";
import Eleventy from "@11ty/eleventy";
import { ROOT, DETAILS_FILE } from "../lib/site-details.js";

// ---- 1. Notes in site-details.yaml ----
const yamlNotes = [];
const lines = fs.readFileSync(DETAILS_FILE, "utf8").split(/\r?\n/);
lines.forEach((line, i) => {
	const match = /#\s*TODO:\s*(.*)$/.exec(line);
	if (!match) return;
	// Include the following comment lines that continue the same note.
	let text = match[1].trim();
	for (let j = i + 1; j < lines.length; j++) {
		const next = /^\s*#\s?(.*)$/.exec(lines[j]);
		if (!next || /TODO:/.test(lines[j]) || next[1].trim() === "") break;
		text += ` ${next[1].trim()}`;
	}
	yamlNotes.push({ line: i + 1, text });
});

// ---- 2. Placeholders shown on the website ----
const elev = new Eleventy(path.join(ROOT, "src"), path.join(ROOT, "_site"), {
	quietMode: true,
	configPath: path.join(ROOT, "eleventy.config.js"),
});
const pages = (await elev.toJSON())
	.filter((p) => p.url && p.outputPath?.endsWith(".html"))
	.sort((a, b) => a.url.localeCompare(b.url));

const decode = (s) => s.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&quot;/g, '"')
	.replace(/&#39;|&#x27;|&rsquo;/g, "'").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

const shown = [];
for (const p of pages) {
	const found = new Set();
	const patterns = [/<mark class="todo">TODO:([\s\S]*?)<\/mark>/g, /\[TODO:([^\]]*)\]/g];
	for (const pattern of patterns) {
		for (const m of p.content.matchAll(pattern)) found.add(decode(m[1]));
	}
	if (found.size) shown.push({ url: p.url, file: path.relative(ROOT, p.inputPath), items: [...found] });
}

// ---- Output ----
const count = yamlNotes.length + shown.reduce((n, p) => n + p.items.length, 0);
const out = [];
out.push("# TODO list", "");
out.push(`Generated ${new Date().toISOString().slice(0, 10)} by \`npm run todo\`. ${count} items.`, "");
out.push("## Notes in site-details.yaml", "", "These don't appear on the website, but the information is still missing.", "");
for (const n of yamlNotes) out.push(`- **Line ${n.line}:** ${n.text}`);
out.push("", "## Placeholders shown on the website", "", "These appear highlighted in yellow on the page listed.", "");
for (const p of shown) {
	out.push(`### ${p.url}  (${p.file.replace(/\\/g, "/")})`, "");
	for (const item of p.items) out.push(`- ${item}`);
	out.push("");
}
const markdown = out.join("\n");

if (process.argv.includes("--write")) {
	const file = path.join(ROOT, "docs", "TODO.md");
	fs.writeFileSync(file, markdown);
	console.log(`Wrote ${count} items to ${path.relative(process.cwd(), file)}`);
} else {
	console.log(markdown);
}
