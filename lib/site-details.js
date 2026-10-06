// Loads site-details.yaml, checks it for mistakes, and adds ready-to-use
// values (formatted dates, the countdown target, etc.) for the templates.
//
// Used by both the website build (src/_data/site.js) and the pre-build
// check (scripts/check-site.js), so volunteers see the same plain-English
// error messages either way.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// SITE_DETAILS_FILE lets developers preview with a different details file
// (for example, to test how the site looks once dates are announced).
export const DETAILS_FILE = process.env.SITE_DETAILS_FILE
	? path.resolve(process.env.SITE_DETAILS_FILE)
	: path.join(ROOT, "site-details.yaml");
const SRC = path.join(ROOT, "src");

const TIME_ZONE = "America/Boise";
const DOCUMENT_AUDIENCES = ["posts", "delegates", "staff"];

const longDate = new Intl.DateTimeFormat("en-US", {
	weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC",
});
const weekdayMonthDay = new Intl.DateTimeFormat("en-US", {
	weekday: "long", month: "long", day: "numeric", timeZone: "UTC",
});
const monthDay = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", timeZone: "UTC" });
const monthOnly = new Intl.DateTimeFormat("en-US", { month: "long", timeZone: "UTC" });

export function ordinal(n) {
	const rem100 = n % 100;
	if (rem100 >= 11 && rem100 <= 13) return `${n}th`;
	return `${n}${{ 1: "st", 2: "nd", 3: "rd" }[n % 10] || "th"}`;
}

function isBlank(value) {
	return value === undefined || value === null || (typeof value === "string" && value.trim() === "");
}

// Like fs.existsSync, but capital letters must match too. Windows and Mac
// ignore capitalization; the web server that hosts the site does not.
function existsExactly(fullPath) {
	const relative = path.relative(ROOT, fullPath);
	let current = ROOT;
	for (const part of relative.split(path.sep)) {
		if (!fs.existsSync(current) || !fs.readdirSync(current).includes(part)) return false;
		current = path.join(current, part);
	}
	return true;
}

// Accepts 2027-04-15 written with or without quotes. Returns null when blank.
function parseDay(value, label, errors) {
	if (isBlank(value)) return null;
	let y, m, d;
	if (value instanceof Date && !Number.isNaN(value.getTime())) {
		[y, m, d] = [value.getUTCFullYear(), value.getUTCMonth() + 1, value.getUTCDate()];
	} else if (typeof value === "string" && /^\d{4}-\d{1,2}-\d{1,2}$/.test(value.trim())) {
		[y, m, d] = value.trim().split("-").map(Number);
	} else {
		errors.push(`${label} should be a date written YEAR-MONTH-DAY, like 2027-04-15. Right now it says: ${value}`);
		return null;
	}
	const date = new Date(Date.UTC(y, m - 1, d));
	if (date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) {
		errors.push(`${label} is not a real calendar date: ${value}`);
		return null;
	}
	return { y, m, d, date };
}

// "-06:00" for summer in Boise, "-07:00" in winter.
function boiseOffset({ y, m, d }) {
	const noonish = new Date(Date.UTC(y, m - 1, d, 19));
	const name = new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, timeZoneName: "longOffset" })
		.formatToParts(noonish)
		.find((part) => part.type === "timeZoneName").value;
	return name === "GMT" ? "+00:00" : name.replace("GMT", "");
}

function isoInBoise(day, time) {
	const pad = (n) => String(n).padStart(2, "0");
	return `${day.y}-${pad(day.m)}-${pad(day.d)}T${time}${boiseOffset(day)}`;
}

function dateRange(start, end) {
	if (start.y !== end.y) {
		return { long: `${longDate.format(start.date)} – ${longDate.format(end.date)}`,
			short: `${longDate.format(start.date)} – ${longDate.format(end.date)}` };
	}
	const short = start.m === end.m
		? `${monthOnly.format(start.date)} ${start.d}–${end.d}, ${end.y}`
		: `${monthDay.format(start.date)} – ${monthDay.format(end.date)}, ${end.y}`;
	return { long: `${weekdayMonthDay.format(start.date)} – ${longDate.format(end.date)}`, short };
}

// Turns a document's "link" into something the templates can use.
function describeDocument(doc, index, errors) {
	const label = `Document #${index + 1}${doc && doc.title ? ` ("${doc.title}")` : ""}`;
	if (!doc || isBlank(doc.title)) errors.push(`${label} needs a title.`);
	const audience = String(doc?.for ?? "").trim().toLowerCase();
	if (!DOCUMENT_AUDIENCES.includes(audience)) {
		errors.push(`${label}: "for" must be one of ${DOCUMENT_AUDIENCES.join(", ")}. Right now it says: ${doc?.for ?? "(nothing)"}`);
	}

	const link = isBlank(doc?.link) ? "" : String(doc.link).trim();
	let href = null;
	let external = false;
	if (/^https?:\/\//i.test(link)) {
		href = link;
		external = true;
	} else if (link) {
		const relative = link.replace(/^\/+/, "").replace(/^src\//, "");
		if (!existsExactly(path.join(SRC, relative))) {
			errors.push(`${label}: can't find the file "${link}". Upload it to the src/documents folder and check the spelling (capital letters matter).`);
		}
		href = `/${relative}`;
	}

	let pathname = "";
	try { pathname = new URL(link || "x:/", "https://example.org/").pathname.toLowerCase(); } catch { /* ignore */ }
	const ext = path.extname(decodeURIComponent(pathname));
	const kind = { ".pdf": "PDF", ".doc": "Word document", ".docx": "Word document", ".xls": "Excel file",
		".xlsx": "Excel file", ".ppt": "PowerPoint", ".pptx": "PowerPoint" }[ext] || (href ? "Web page" : "");

	return { title: doc?.title ?? "", for: audience, note: doc?.note ?? "", href, external, kind };
}

/**
 * Reads site-details.yaml.
 * @returns {{ data: object|null, errors: string[], warnings: string[] }}
 */
export function loadSiteDetails({ now = new Date() } = {}) {
	const errors = [];
	const warnings = [];

	let raw;
	let text = "";
	try {
		text = fs.readFileSync(DETAILS_FILE, "utf8");
		raw = yaml.load(text);
	} catch (err) {
		if (err.mark) {
			// The real mistake is often on a line just above the one the parser reports.
			const lines = text.split(/\r?\n/);
			const from = Math.max(0, err.mark.line - 2);
			const context = lines.slice(from, err.mark.line + 1)
				.map((line, i) => `      line ${from + i + 1}: ${line}`).join("\n");
			errors.push(`site-details.yaml has a formatting problem around line ${err.mark.line + 1}:\n${context}\n    ` +
				"This is usually a missing quotation mark, a missing colon, or extra/missing spaces at the start of a line. " +
				`(Technical detail: ${err.reason}.)`);
		} else {
			errors.push(`Couldn't read site-details.yaml: ${err.message}`);
		}
		return { data: null, errors, warnings };
	}
	if (!raw || typeof raw !== "object") {
		errors.push("site-details.yaml is empty.");
		return { data: null, errors, warnings };
	}

	const need = (value, label) => { if (isBlank(value)) errors.push(`${label} is missing.`); };
	const needNumber = (value, label) => {
		if (typeof value !== "number" || Number.isNaN(value)) errors.push(`${label} should be a number (digits only, no $ sign). Right now it says: ${value}`);
	};

	const session = { ...(raw.session || {}) };
	const venue = { ...(raw.venue || {}) };
	const cost = { ...(raw.cost || {}) };
	const registration = { ...(raw.registration || {}) };
	const contact = { ...(raw.contact || {}) };
	const links = { ...(raw.links || {}) };
	const messages = { ...(raw.messages || {}) };
	const emblem = { ...(raw.legion_emblem || {}) };

	need(raw.program_name, "program_name");
	needNumber(session.year, "session: year");
	needNumber(session.number, "session: number");
	needNumber(session.capacity, "session: capacity");
	need(venue.name, "venue: name");
	need(venue.city, "venue: city");
	needNumber(cost.amount, "cost: amount");
	need(contact.email, "contact: email");
	need(registration.email, "registration: email");
	need(links.find_a_post, "links: find_a_post");
	if (!Array.isArray(registration.mailing_address) || registration.mailing_address.length === 0) {
		errors.push("registration: mailing_address needs at least one line.");
	}
	for (const key of ["dates_announced", "capacity_reached"]) {
		if (typeof session[key] !== "boolean") errors.push(`session: ${key} must be true or false (no quotation marks).`);
	}
	if (typeof raw.prototype !== "boolean") errors.push("prototype must be true or false (no quotation marks).");

	// ----- Dates -----
	const start = parseDay(session.start_date, "session: start_date", errors);
	const end = parseDay(session.end_date, "session: end_date", errors);
	const deadline = parseDay(session.application_deadline, "session: application_deadline", errors);
	const refund = parseDay(session.refund_deadline, "session: refund_deadline", errors);

	if (session.dates_announced === true) {
		const required = "(needed once dates_announced is true)";
		if (isBlank(session.start_date)) need(null, `session: start_date ${required}`);
		if (isBlank(session.end_date)) need(null, `session: end_date ${required}`);
		if (isBlank(session.application_deadline)) need(null, `session: application_deadline ${required}`);
		if (start && end && end.date < start.date) errors.push("session: end_date is before start_date.");
		if (start && deadline && deadline.date > start.date) errors.push("session: application_deadline is after the session starts.");
		if (start && start.y !== session.year) warnings.push(`session: start_date is in ${start.y}, but session: year says ${session.year}.`);
	}

	const year = session.year;
	const announced = session.dates_announced === true && start && end && deadline;
	const range = announced ? dateRange(start, end) : null;
	const isoStart = announced ? isoInBoise(start, "00:00:00") : "";
	const isoEnd = announced ? isoInBoise(end, "23:59:59") : "";
	const isoDeadline = announced ? isoInBoise(deadline, "23:59:59") : "";

	let status = "coming-soon";
	if (announced) {
		const t = now.getTime();
		if (t > Date.parse(isoEnd)) status = "over";
		else if (t >= Date.parse(isoStart)) status = "in-session";
		else if (session.capacity_reached) status = "full";
		else if (t > Date.parse(isoDeadline)) status = "closed";
		else status = "open";
	}

	Object.assign(session, {
		announced: Boolean(announced),
		ordinal: typeof session.number === "number" ? ordinal(session.number) : "",
		dates_text: announced ? range.long : "Dates coming soon",
		dates_short: announced ? range.short : "Dates coming soon",
		deadline_text: announced ? longDate.format(deadline.date) : "To be announced",
		deadline_sentence: announced
			? `Applications are due ${longDate.format(deadline.date)}.`
			: `The ${year} application deadline will be announced with the session dates.`,
		refund_text: announced && refund ? longDate.format(refund.date) : "To be announced",
		refund_sentence: announced && refund
			? `If a delegate drops out before ${longDate.format(refund.date)}, the fee is refunded. After that date, it is not.`
			: `The fee is refundable if a delegate drops out before the refund deadline, which will be announced with the ${year} session dates. After that date, it is not.`,
		iso_start: isoStart,
		iso_end: isoEnd,
		iso_deadline: isoDeadline,
		status,
	});

	// ----- Everything else -----
	cost.text = typeof cost.amount === "number"
		? `$${cost.amount.toLocaleString("en-US", { minimumFractionDigits: Number.isInteger(cost.amount) ? 0 : 2 })}`
		: "";
	cost.check_payable_to_text = isBlank(cost.check_payable_to)
		? "[TODO: who checks are payable to, set in site-details.yaml]"
		: cost.check_payable_to;

	contact.people = (Array.isArray(contact.people) ? contact.people : []).map((person, i) => {
		if (isBlank(person?.name)) errors.push(`contact: people #${i + 1} needs a name.`);
		const phone = isBlank(person?.phone) ? "" : String(person.phone);
		const digits = phone.replace(/\[[^\]]*\]/g, "").replace(/\D/g, "");
		if (/555-?01\d\d/.test(phone)) warnings.push(`The phone number for ${person.name} is a placeholder (${phone.replace(/\s*\[.*$/, "")}).`);
		return {
			name: person?.name ?? "",
			title: person?.title ?? "",
			phone,
			tel: digits.length === 10 ? `+1${digits}` : digits,
			email: isBlank(person?.email) ? "" : person.email,
		};
	});

	const documents = (Array.isArray(raw.documents) ? raw.documents : []).map((doc, i) => describeDocument(doc, i, errors));

	if (emblem.approved === true) {
		if (isBlank(emblem.image)) errors.push("legion_emblem: approved is true, but no image file is listed.");
		else if (!existsExactly(path.join(SRC, String(emblem.image).replace(/^\/+/, "")))) {
			errors.push(`legion_emblem: can't find the image "${emblem.image}" in the src folder.`);
		}
	}

	if (isBlank(raw.website_address)) warnings.push("website_address is empty, so share previews and the sitemap are turned off until the domain is set.");

	const data = {
		...raw,
		website_address: isBlank(raw.website_address) ? "" : String(raw.website_address).trim().replace(/\/+$/, ""),
		session,
		venue: { ...venue, address: isBlank(venue.address) ? "" : venue.address, note: isBlank(venue.note) ? "" : venue.note },
		cost,
		registration,
		contact,
		links,
		messages,
		legion_emblem: { ...emblem, image: isBlank(emblem.image) ? "" : `/${String(emblem.image).replace(/^\/+/, "")}` },
		documents,
		analytics_token: isBlank(raw.analytics_token) ? "" : String(raw.analytics_token).trim(),
		build_year: now.getFullYear(),
	};

	return { data, errors, warnings };
}
