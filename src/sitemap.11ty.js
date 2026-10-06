// A list of every page for search engines. Only written once
// site-details.yaml has a website_address (it needs full web addresses).

export default class Sitemap {
	data() {
		return {
			eleventyExcludeFromCollections: true,
			permalink: (data) => (data.site.website_address ? "/sitemap.xml" : false),
		};
	}

	render({ collections, site }) {
		const urls = collections.all
			.filter((page) => page.url && !page.data.exclude_from_sitemap)
			.map((page) => `  <url><loc>${site.website_address}${page.url}</loc></url>`);
		return `<?xml version="1.0" encoding="utf-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
	}
}
