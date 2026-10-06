// Makes everything in site-details.yaml available to pages as {{ site.… }}.
// Volunteers: don't edit this file. Edit site-details.yaml instead.

import { loadSiteDetails } from "../../lib/site-details.js";

export default function () {
	const { data, errors } = loadSiteDetails();
	if (errors.length) {
		throw new Error(`Please fix site-details.yaml:\n  - ${errors.join("\n  - ")}`);
	}
	return data;
}
