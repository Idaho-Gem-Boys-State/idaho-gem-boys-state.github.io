// Building blocks that page files (src/pages/*.md) can use, written like
// {% findAPost %} or {% faq "Question?" %}Answer{% endfaq %}.
// Each one is described in docs/FOR-DEVELOPERS.md.
//
// Every block returns HTML with no blank lines in it, because a blank line
// inside HTML makes Markdown stop treating it as HTML.

import { md } from "./markdown.js";
import { loadSiteDetails } from "./site-details.js";

let site = loadSiteDetails().data;

const esc = (value) => String(value ?? "")
	.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const compact = (html) => html.replace(/\n\s*\n/g, "\n").trim();

function dedent(text) {
	const lines = String(text ?? "").replace(/^\n+|\s+$/g, "").split("\n");
	const indents = lines.filter((l) => l.trim()).map((l) => l.match(/^[ \t]*/)[0].length);
	const cut = indents.length ? Math.min(...indents) : 0;
	return lines.map((l) => l.slice(cut)).join("\n");
}

const renderBlock = (content) => compact(md.render(dedent(content)))
	// Styled lists drop their "list" meaning in some screen readers unless it's explicit.
	.replace(/<(ol|ul)>/g, '<$1 role="list">');
const renderInline = (text) => md.renderInline(String(text ?? ""));

export const icon = (name, cls = "icon") =>
	`<svg class="${cls}" aria-hidden="true" focusable="false"><use href="#i-${esc(name)}"></use></svg>`;

const externalNote = '<span class="visually-hidden"> (opens the American Legion website)</span>';

function fact(iconName, label, value) {
	return `<div class="fact"><dt>${icon(iconName)}${label}</dt><dd>${value}</dd></div>`;
}

function sessionFacts(audience = "students") {
	const s = site.session;
	const when = s.announced
		? esc(s.dates_text)
		: `<strong>Dates coming soon.</strong> <span class="fact__sub">${esc(s.coming_soon_message)}</span>`;
	const where = `${esc(site.venue.name)}<span class="fact__sub">${esc(site.venue.city)}${site.venue.address ? `<br>${esc(site.venue.address)}` : ""}</span>`;
	const rows = [fact("calendar", "When", when), fact("pin", "Where", where)];

	if (audience === "posts") {
		rows.push(
			fact("dollar", "Cost", `${esc(site.cost.text)} per delegate`),
			fact("clock", "Applications due", esc(s.deadline_text)),
			fact("undo", "Refund deadline", esc(s.refund_text)),
			fact("users", "Spots", `${esc(s.capacity)} delegates <span class="fact__sub">then a stand-by list</span>`),
		);
	} else if (audience !== "delegates") {
		rows.push(
			fact("dollar", "Cost", `${esc(site.cost.text)} <span class="fact__sub">usually paid by a sponsor</span>`),
			fact("clock", "Applications due", esc(s.deadline_text)),
			fact("users", "Spots", `${esc(s.capacity)} delegates <span class="fact__sub">then a stand-by list</span>`),
		);
	}
	return `<dl class="facts">${rows.join("")}</dl>`;
}

function documentList(audience) {
	const docs = site.documents.filter((doc) => !audience || doc.for === audience);
	if (!docs.length) return '<p class="muted">No documents are posted yet.</p>';
	const items = docs.map((doc) => {
		const kind = doc.kind ? ` <span class="doc__kind">${esc(doc.kind)}</span>` : "";
		const title = doc.href
			? `<a href="${esc(doc.href)}">${esc(doc.title)}${kind}</a>`
			: `${esc(doc.title)} <span class="badge">Coming soon</span>`;
		const note = doc.note ? `<p class="doc__note">${renderInline(doc.note)}</p>` : "";
		return `<li class="doc${doc.href ? "" : " doc--soon"}"><span class="doc__icon">${icon(doc.kind === "Web page" ? "link" : "file")}</span><div><p class="doc__title">${title}</p>${note}</div></li>`;
	});
	return `<ul class="doc-list" role="list">${items.join("")}</ul>`;
}

function phoneLink(phone, tel) {
	const [number, ...rest] = phone.split(/(?=\[)/);
	// Non-breaking spaces and hyphens keep the number on one line.
	const display = esc(number.trim()).replace(/ /g, "&nbsp;").replace(/-/g, "&#8209;");
	return `<a href="tel:${esc(tel)}">${display}</a>${rest.length ? ` ${esc(rest.join(""))}` : ""}`;
}

function contactList() {
	const cards = [
		`<li class="contact-card"><p class="contact-card__name">${icon("mail")}Program email</p><p><a href="mailto:${esc(site.contact.email)}">${esc(site.contact.email)}</a></p></li>`,
		...site.contact.people.map((person) => {
			const lines = [`<p class="contact-card__name">${icon("users")}${esc(person.name)}</p>`];
			if (person.title) lines.push(`<p class="contact-card__title">${esc(person.title)}</p>`);
			if (person.phone) lines.push(`<p>${phoneLink(person.phone, person.tel)}</p>`);
			if (person.email) lines.push(`<p><a href="mailto:${esc(person.email)}">${esc(person.email)}</a></p>`);
			return `<li class="contact-card">${lines.join("")}</li>`;
		}),
	];
	return `<ul class="contact-cards" role="list">${cards.join("")}</ul>`;
}

function socialLinks() {
	if (!site.links.instagram) {
		return '<p>[TODO: Add the official Instagram address in site-details.yaml.]</p>';
	}
	return `<p class="social"><a class="btn btn--ghost-dark" href="${esc(site.links.instagram)}">${icon("instagram")}Gem Boys State on Instagram</a></p>`;
}

function photo(src, alt, caption) {
	if (!src) {
		return `<figure class="photo photo--placeholder"><div class="photo__frame">${icon("camera", "icon icon--lg")}<p>[TODO: Photo: ${esc(alt || "add a photo")}. Use only photos taken with consent that don't give away the week.]</p></div></figure>`;
	}
	const cap = caption ? `<figcaption>${renderInline(caption)}</figcaption>` : "";
	return `<figure class="photo"><img src="/${esc(String(src).replace(/^\/+/, ""))}" alt="${esc(alt)}" loading="lazy" decoding="async">${cap}</figure>`;
}

function video(youtubeId, title = "Video") {
	if (!youtubeId) {
		return `<div class="video video--placeholder">${icon("play", "icon icon--lg")}<p>[TODO: Video: ${esc(title)}. Once a video is approved, put its YouTube ID in this page's file.]</p></div>`;
	}
	const id = esc(youtubeId);
	return `<div class="video" data-video-id="${id}" data-video-title="${esc(title)}"><a class="video__start" href="https://www.youtube.com/watch?v=${id}">${icon("play", "icon icon--lg")}<span>Play video: ${esc(title)}</span></a><p class="video__note">Plays from YouTube in privacy-enhanced mode. Nothing loads until you press play.</p></div>`;
}

function emblem() {
	const e = site.legion_emblem;
	if (e.approved && e.image) {
		return `<img class="emblem" src="${esc(e.image)}" alt="${esc(e.alt)}" width="96" height="96">`;
	}
	return `<div class="emblem-placeholder"><span class="emblem-placeholder__mark" aria-hidden="true"></span><p><strong>Placeholder:</strong> American Legion emblem, pending Department of Idaho approval.</p></div>`;
}

export function registerShortcodes(eleventyConfig) {
	// Re-read site-details.yaml at the start of every build, so the preview
	// server picks up changes right away.
	eleventyConfig.on("eleventy.before", () => {
		const { data } = loadSiteDetails();
		if (data) site = data;
	});

	eleventyConfig.addShortcode("icon", (name) => icon(name));
	eleventyConfig.addShortcode("sessionFacts", sessionFacts);
	eleventyConfig.addShortcode("documentList", documentList);
	eleventyConfig.addShortcode("contactList", contactList);
	eleventyConfig.addShortcode("socialLinks", socialLinks);
	eleventyConfig.addShortcode("photo", photo);
	eleventyConfig.addShortcode("video", video);
	eleventyConfig.addShortcode("emblem", emblem);

	eleventyConfig.addShortcode("mailingAddress", () =>
		`<address class="mail-address">${site.registration.mailing_address.map(esc).join("<br>")}</address>`);

	eleventyConfig.addShortcode("findAPost", (label = "Find a Post near you") =>
		`<p class="action"><a class="btn btn--garnet btn--lg" href="${esc(site.links.find_a_post)}">${esc(label)}${icon("external")}${externalNote}</a></p>`);

	eleventyConfig.addShortcode("button", (label, url, style = "garnet") =>
		`<a class="btn btn--${esc(style)}" href="${esc(url)}">${esc(label)}${icon("arrow-right")}</a>`);

	eleventyConfig.addPairedShortcode("callout", (content, title, style = "navy") =>
		`<div class="callout callout--${esc(style)}" role="note">${title ? `<p class="callout__title">${icon("star")}${renderInline(title)}</p>` : ""}<div class="callout__body">${renderBlock(content)}</div></div>`);

	eleventyConfig.addPairedShortcode("faq", (content, question) =>
		`<details class="faq"><summary>${renderInline(question)}</summary><div class="faq__body">${renderBlock(content)}</div></details>`);

	eleventyConfig.addPairedShortcode("steps", (content) =>
		`<div class="steps">${renderBlock(content)}</div>`);

	eleventyConfig.addPairedShortcode("cards", (content) =>
		`<div class="card-grid">${compact(content)}</div>`);

	eleventyConfig.addPairedShortcode("card", (content, title, iconName) =>
		`<div class="card">${iconName ? `<span class="card__icon">${icon(iconName)}</span>` : ""}<h3 class="card__title">${renderInline(title)}</h3><div class="card__body">${renderBlock(content)}</div></div>`);
}
