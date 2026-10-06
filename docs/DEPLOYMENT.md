# Deploying the website

The site is hosted for free on **GitHub Pages**. GitHub rebuilds and republishes it automatically every time a change is saved to the `main` branch, using the workflow in `.github/workflows/deploy.yml`.

There's no server, database, or paid service. The only optional cost is a custom domain name, about $10–20 per year.

---

## Where things are

| | |
|---|---|
| GitHub organization | https://github.com/Idaho-Gem-Boys-State (owner: `dmfenter`) |
| Repository | https://github.com/Idaho-Gem-Boys-State/idaho-gem-boys-state.github.io |
| Live site | https://idaho-gem-boys-state.github.io |

The repository is named `idaho-gem-boys-state.github.io` on purpose. A repository named `<organization>.github.io` is published at the root of `https://<organization>.github.io`, with no extra folder in the address.

## 1. Put the project on GitHub (one time; already done)

1. In the organization, create a **Public** repository named `idaho-gem-boys-state.github.io` (GitHub Pages is free for public repositories). Don't add a README, .gitignore, or license; the project has its own.
2. Push the project from this folder:
   ```bash
   git remote add origin https://github.com/Idaho-Gem-Boys-State/idaho-gem-boys-state.github.io.git
   git push -u origin main
   ```
   GitHub Desktop also works: *File → Add local repository*, then *Publish*.

The `.gitignore` file keeps `node_modules/` and `_site/` out of GitHub.

## 2. Turn on GitHub Pages (one time; already done)

1. In the repository, open **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Open the **Actions** tab. If the "Publish website" workflow hasn't run yet, or failed because Pages wasn't on yet, open it and click **Re-run all jobs** (or **Run workflow**).
4. When it shows a green check mark, the site is live at https://idaho-gem-boys-state.github.io

From then on, every saved change publishes itself in about two minutes.

## 3. Connect a custom domain (once one is purchased)

1. **Buy the domain** from any registrar (for example Cloudflare, Namecheap, or Porkbun). Register it to an account the **Department of Idaho** controls, not a personal account, so it doesn't leave with any one volunteer. Turn on auto-renew.
2. **Point the domain at GitHub.** In the registrar's DNS settings, add:

   | Type | Name | Value |
   |---|---|---|
   | `CNAME` | `www` | `idaho-gem-boys-state.github.io` |
   | `A` | `@` | `185.199.108.153` |
   | `A` | `@` | `185.199.109.153` |
   | `A` | `@` | `185.199.110.153` |
   | `A` | `@` | `185.199.111.153` |
   | `AAAA` | `@` | `2606:50c0:8000::153` |
   | `AAAA` | `@` | `2606:50c0:8001::153` |
   | `AAAA` | `@` | `2606:50c0:8002::153` |
   | `AAAA` | `@` | `2606:50c0:8003::153` |

   These values come from GitHub's documentation ("Managing a custom domain for your GitHub Pages site"). Check it in case they've changed.
3. **Tell GitHub.** In **Settings → Pages → Custom domain**, enter `www.yourdomain.org` and save. When the DNS check passes (it can take up to a day), tick **Enforce HTTPS**.
4. **Verify the domain** in your GitHub account or organization settings (**Settings → Pages → Add a domain**). This stops anyone else from claiming it on GitHub.
5. **Update the site:** in `site-details.yaml`, set
   `website_address: "https://www.yourdomain.org"`
   This turns on link previews (the image people see when the link is shared) and the sitemap for search engines.

No other changes are needed. Once the domain is connected, GitHub automatically forwards the old `idaho-gem-boys-state.github.io` address to it, so links already sent out keep working.

## 4. Visitor counts (optional)

The site supports **Cloudflare Web Analytics**. It's free, uses no cookies, and collects no personal information, which matters because most visitors are minors.

1. Create a free account at cloudflare.com.
2. Go to **Analytics & Logs → Web Analytics → Add a site**, enter the site's hostname, and choose the manual (JavaScript snippet) setup.
3. Cloudflare shows a snippet containing `"token": "…"`. Copy only the token value.
4. Paste it into `site-details.yaml` as `analytics_token: "the-token"`.

To turn visitor counting off, set `analytics_token: ""`.

## 5. Long-term ownership

The project already lives in its own free GitHub organization (`Idaho-Gem-Boys-State`) rather than a personal account, so it can outlive any one volunteer:

1. Add at least **two adults** from the Department of Idaho as organization **Owners**: **Organization → People → Invite member → Role: Owner**.
2. Add volunteers who update the site as members with **Write** access to the repository.
3. Keep the domain registration in a Department-owned account too.

Never rename the organization or the repository. The web address is built from those names, so renaming them would break it.

## 6. Launch checklist

Before telling anyone the site is official:

- [ ] Department of Idaho approval of the site and its use of Legion branding
- [ ] `prototype: false` in `site-details.yaml` (removes the banner; allows search engines)
- [ ] `website_address` set to the final domain
- [ ] Every item in `docs/TODO.md` resolved or deliberately left out
- [ ] Placeholder phone number replaced or removed
- [ ] Test on a phone: home page, How to Attend, the Find a Post button, the menu
- [ ] Share the link in a text message to check the preview image and title
