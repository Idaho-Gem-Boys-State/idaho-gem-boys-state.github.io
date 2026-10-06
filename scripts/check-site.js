// Checks site-details.yaml and the page files for common mistakes.
// Runs automatically before every build. Run it yourself with: npm run check

import fs from "node:fs";
import path from "node:path";
import { loadSiteDetails, ROOT, DETAILS_FILE } from "../lib/site-details.js";

const { data, errors, warnings } = loadSiteDetails();

// Files that must never name the venue (everything a volunteer might edit,
// other than site-details.yaml itself).
const SCAN_DIRS = ["src", "docs"];
const SCAN_FILES = ["README.md"];
const SCAN_EXT = new Set([".md", ".njk", ".html", ".js", ".css", ".yaml", ".yml", ".json", ".txt"]);

function* walk(dir) {
	if (!fs.existsSync(dir)) return;
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) yield* walk(full);
		else if (SCAN_EXT.has(path.extname(entry.name).toLowerCase())) yield full;
	}
}

if (data) {
	const words = (Array.isArray(data.venue.check_words) ? data.venue.check_words : [])
		.map((w) => String(w).trim())
		.filter(Boolean);
	const files = [
		...SCAN_DIRS.flatMap((d) => [...walk(path.join(ROOT, d))]),
		...SCAN_FILES.map((f) => path.join(ROOT, f)).filter((f) => fs.existsSync(f)),
	].filter((f) => path.resolve(f) !== path.resolve(DETAILS_FILE));

	for (const file of files) {
		const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
		lines.forEach((line, i) => {
			for (const word of words) {
				if (line.toLowerCase().includes(word.toLowerCase())) {
					errors.push(`${path.relative(ROOT, file)}, line ${i + 1}, mentions "${word}". ` +
						"The venue should only be named in site-details.yaml. In page files, write {{ site.venue.name }} instead.");
				}
			}
		});
	}
}

const rel = path.relative(process.cwd(), DETAILS_FILE) || "site-details.yaml";
for (const warning of warnings) console.warn(`  Note: ${warning}`);

if (errors.length) {
	console.error(`\nThe website was NOT built. Please fix ${errors.length === 1 ? "this problem" : `these ${errors.length} problems`}:\n`);
	for (const error of errors) console.error(`  - ${error}`);
	console.error(`\n(Most settings live in ${rel}. See README.md for help.)\n`);
	process.exit(1);
}

console.log("  Site details look good.");
