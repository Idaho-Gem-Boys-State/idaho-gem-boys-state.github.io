// Wraps every [TODO: ...] in visible page text in a yellow highlight, so
// missing information is impossible to miss. Text inside tags (alt text,
// links, etc.) and inside <title>, <script>, and <style> is left alone.

const TODO = /\[TODO:([^\]]*)\]/g;
const SKIP_INSIDE = new Set(["title", "script", "style", "textarea"]);

export function highlightTodos(html) {
	if (!html.includes("[TODO:")) return html;
	let skipping = null;
	return html
		.split(/(<[^>]+>)/)
		.map((part) => {
			if (part.startsWith("<")) {
				const tag = /^<\/?([a-z0-9]+)/i.exec(part)?.[1]?.toLowerCase();
				if (tag && SKIP_INSIDE.has(tag)) skipping = part.startsWith("</") ? null : tag;
				return part;
			}
			if (skipping) return part;
			return part.replace(TODO, '<mark class="todo">TODO:$1</mark>');
		})
		.join("");
}
