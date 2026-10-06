// Gem Boys State: small enhancements. Every page still works without this file.

(() => {
	// ---- Phone menu ----
	const header = document.querySelector("[data-header]");
	const toggle = header && header.querySelector(".nav-toggle");
	if (toggle) {
		const label = toggle.querySelector(".nav-toggle__label");
		const setOpen = (open) => {
			toggle.setAttribute("aria-expanded", String(open));
			header.toggleAttribute("data-open", open);
			if (label) label.textContent = open ? "Close" : "Menu";
		};
		toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
		document.addEventListener("keydown", (event) => {
			if (event.key === "Escape" && header.hasAttribute("data-open")) {
				setOpen(false);
				toggle.focus();
			}
		});
		// Close the menu when keyboard focus moves on past it.
		header.addEventListener("focusout", (event) => {
			if (header.hasAttribute("data-open") && event.relatedTarget && !header.contains(event.relatedTarget)) setOpen(false);
		});
		window.matchMedia("(min-width: 70rem)").addEventListener("change", (event) => {
			if (event.matches) setOpen(false);
		});
	}

	// ---- Home page countdown and session status ----
	const card = document.querySelector("[data-session][data-deadline]");
	if (card) {
		const deadline = Date.parse(card.dataset.deadline);
		const start = Date.parse(card.dataset.start);
		const end = Date.parse(card.dataset.end);
		const full = card.dataset.full === "true";
		const setUnit = (unit, value, singular, plural) => {
			const num = card.querySelector(`[data-unit="${unit}"]`);
			const lbl = card.querySelector(`[data-label="${unit}"]`);
			if (num) num.textContent = String(value);
			if (lbl) lbl.textContent = value === 1 ? singular : plural;
		};
		const update = () => {
			const now = Date.now();
			const state = now > end ? "over"
				: now >= start ? "in-session"
				: full ? "full"
				: now > deadline ? "closed"
				: "open";
			card.querySelectorAll("[data-state]").forEach((el) => { el.hidden = el.dataset.state !== state; });
			if (state === "open") {
				let minutes = Math.max(0, Math.floor((deadline - now) / 60000));
				const days = Math.floor(minutes / 1440);
				minutes -= days * 1440;
				const hours = Math.floor(minutes / 60);
				minutes -= hours * 60;
				setUnit("days", days, "day", "days");
				setUnit("hours", hours, "hour", "hours");
				setUnit("minutes", minutes, "min", "min");
			}
		};
		update();
		setInterval(update, 30000);
	}

	// ---- Videos load from YouTube only after someone presses play ----
	document.querySelectorAll("[data-video-id]").forEach((box) => {
		const start = box.querySelector(".video__start");
		if (!start) return;
		start.addEventListener("click", (event) => {
			event.preventDefault();
			const frame = document.createElement("iframe");
			frame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(box.dataset.videoId)}?autoplay=1&rel=0`;
			frame.title = box.dataset.videoTitle || "Video";
			frame.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
			frame.allowFullscreen = true;
			box.replaceChildren(frame);
			frame.focus();
		});
	});

	// ---- Print every FAQ answer, not just the open ones ----
	const closed = [];
	window.addEventListener("beforeprint", () => {
		document.querySelectorAll("details:not([open])").forEach((d) => { closed.push(d); d.open = true; });
	});
	window.addEventListener("afterprint", () => {
		closed.splice(0).forEach((d) => { d.open = false; });
	});
})();
