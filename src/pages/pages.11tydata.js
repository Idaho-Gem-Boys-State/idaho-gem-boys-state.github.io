// Settings shared by every page in this folder. Volunteers don't need to
// edit this file.
//
// A page's web address comes from its file name:
//   about.md        ->  /about/
//   how-to-attend.md -> /how-to-attend/
//   home.md         ->  /  (the home page)

export default {
	layout: "layouts/page.njk",
	cta: true,
	eleventyComputed: {
		permalink: (data) => {
			const slug = data.page.fileSlug;
			if (slug === "home") return "/";
			if (slug === "404") return "/404.html";
			return `/${slug}/`;
		},
	},
};
