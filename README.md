# How to update the site for a new year

This is the website for **Gem Boys State**, Idaho's week-long civics program for rising high school seniors.

You don't need to know how to code to keep it up to date. Everything happens on GitHub, in your web browser. When you save a change, the website rebuilds itself and the new version goes live about two minutes later.

> **The most important rule:** the activities, traditions, events, and schedule of the week are a surprise on purpose. Never describe them on the website. Describe the week only in broad strokes, as the existing pages do.

---

## Contents

1. [Before you start](#1-before-you-start)
2. [How to edit a file on GitHub](#2-how-to-edit-a-file-on-github)
3. [The yearly checklist](#3-the-yearly-checklist)
4. [Uploading documents](#4-uploading-documents)
5. [Changing the words on a page](#5-changing-the-words-on-a-page)
6. [Adding photos](#6-adding-photos)
7. [Special situations](#7-special-situations)
8. [If something goes wrong](#8-if-something-goes-wrong)
9. [What's still missing](#9-whats-still-missing)

---

## 1. Before you start

You need:

- **A free GitHub account.** Sign up at github.com.
- **Permission to edit this project.** Ask an owner of the **Idaho-Gem-Boys-State** organization on GitHub to add you. *(Current owner: GitHub user `dmfenter`. Update this line when that changes.)*

Two places to bookmark:

- **The project on GitHub**, where you make changes: https://github.com/Idaho-Gem-Boys-State/idaho-gem-boys-state.github.io
- **The live website**, where you check your changes: https://idaho-gem-boys-state.github.io *(update this once the site has its own domain name)*

---

## 2. How to edit a file on GitHub

1. Open the project on GitHub and click the file you want to change.
2. Click the **pencil icon** (top right of the file) to start editing.
3. Make your change.
4. Click the green **Commit changes...** button. In the box that appears, write a short note about what you changed (for example, "2027 dates"), then click **Commit changes** again.
5. Wait about two minutes, then refresh the live website to see your change.

To check that it worked, click the **Actions** tab at the top of the project:

- A **green check mark** means your change is live.
- A **red X** means something needs fixing. The website keeps showing the previous version until it's fixed, so nothing breaks for visitors. See [If something goes wrong](#8-if-something-goes-wrong).

---

## 3. The yearly checklist

Almost everything that changes from year to year lives in **one file: `site-details.yaml`**. It's at the top level of the project. Every date, price, place, contact, and document link on the website comes from it.

It's full of notes (lines starting with `#`) explaining each setting. A few rules:

- Only change the text **after** the colon (`:`) on a line.
- Keep the `"quotation marks"` around text that already has them.
- **Don't change the spaces at the start of a line.** They matter.
- Write dates as **YEAR-MONTH-DAY**: `2027-04-15` means April 15, 2027.
- `true` and `false` never get quotation marks.

### When the new session's dates are set (usually early in the year)

In `site-details.yaml`, **section 3 (The next session)**:

- [ ] `year`: the session's year, for example `2028`
- [ ] `number`: which session it is (2026 was the 82nd, so 2028 is the 84th)
- [ ] `start_date`, `end_date`, `application_deadline`, `refund_deadline`
- [ ] `capacity`: the most delegates who can attend
- [ ] `capacity_reached`: set back to `false`
- [ ] `dates_announced`: change to `true`. This turns on the countdown on the home page.

Then check the other sections:

- [ ] **Section 4 (Where):** still the right venue?
- [ ] **Section 5 (Cost):** still the right amount? Who checks are payable to?
- [ ] **Section 7 (Contacts):** still the right people and phone numbers?
- [ ] **Section 9 (Documents):** upload the new application packet and Post Commander letter (see [Uploading documents](#4-uploading-documents)) and update the list.

### During the application season

- [ ] When every spot is taken, set `capacity_reached: true`. The home page will tell families to contact their Post about the stand-by list.

You don't need to do anything when the deadline passes or the session starts. The home page changes its message automatically.

### After the session

- [ ] Add the two new **Boys Nation senators** to `src/pages/boys-nation.md`, newest year at the top.
- [ ] When you're ready to start the next year, change `year` and `number`, set `dates_announced: false`, and update `coming_soon_message` (for example, "Dates for the 2028 session will be announced in early 2028."). The home page will show "Dates coming soon" until the new dates are set.

---

## 4. Uploading documents

Documents (PDFs and Word files) can live in two places:

- **On this website (recommended).** Their web addresses never change.
- **On another website**, like the Department of Idaho site. Paste the full address starting with `https://`.

**To upload a document to this website:**

1. In the project on GitHub, open the folder `src`, then `documents`.
2. Click **Add file → Upload files**, then drag your file in.
3. Click **Commit changes**.

Give files short, simple names with no spaces, like `2028-application-packet.pdf`. Capital letters matter: `Packet.pdf` and `packet.pdf` are different files.

**To list it on the website**, add an entry to section 9 of `site-details.yaml`:

```yaml
  - title: "2028 Application Packet"
    for: posts
    link: "documents/2028-application-packet.pdf"
    note: ""
```

- `for` decides which page lists it: `posts` (For Legion Posts), `delegates` (Getting Ready), or `staff` (Staff & Volunteers). Every document also appears on the Documents page.
- Leave `link` as `""` to show "Coming soon."
- Delete last year's entries when they're no longer useful.

---

## 5. Changing the words on a page

Each page's words are in a file in the folder `src/pages`:

| Page | File |
|---|---|
| Home | `src/pages/home.md` (the words for each section are near the top) |
| The Experience | `src/pages/the-experience.md` |
| How to Attend | `src/pages/how-to-attend.md` |
| Getting Ready | `src/pages/getting-ready.md` |
| For Legion Posts | `src/pages/for-posts.md` |
| About | `src/pages/about.md` |
| Boys Nation & Alumni | `src/pages/boys-nation.md` |
| Staff & Volunteers | `src/pages/staff.md` |
| Documents | `src/pages/documents.md` |
| Partners & Supporters | `src/pages/partners.md` |
| Contact | `src/pages/contact.md` |
| Privacy | `src/pages/privacy.md` |

These files use **Markdown**, a simple way to format text:

| You type | You get |
|---|---|
| `## Section title` | A section heading |
| `**bold words**` | **bold words** |
| `*slanted words*` | *slanted words* |
| `- an item` (at the start of a line) | A bullet point |
| `[link text](https://example.org)` | A link |

Leave a blank line between paragraphs.

**Parts to leave alone (or copy carefully):**

- **`{{ site.something }}`**: fills in automatically from `site-details.yaml`, like the year or the cost. Don't type the actual value. Change it in `site-details.yaml` instead.
- **`{% something %}`**: a ready-made building block, like a question-and-answer box. To add another one, copy an existing one, including its matching `{% end... %}` line. For example:

  ```
  {% faq "Your question here?" %}
  The answer goes here.
  {% endfaq %}
  ```

- **`{# ... #}`**: a note for editors. It never appears on the website.
- **`[TODO: ...]`**: missing information. It shows up highlighted in yellow until someone replaces it with the real information.

**Never type the venue name into a page file.** Use `{{ site.venue.name }}` so it updates automatically when the venue changes. The site checks for this and won't build if the venue name appears in a page file.

---

## 6. Adding photos

Only post a photo if:

- **Everyone identifiable in it has given consent.** Most delegates are minors, so that means a parent or guardian's consent too.
- **It doesn't give away the week**: no specific events, traditions, or schedules.

To add one:

1. Make the photo smaller first (under about 500 KB). A free tool like squoosh.app works well.
2. Upload it to `src/images` the same way as a document.
3. In the page file, find a photo placeholder that looks like `{% photo "", "..." %}`, and fill it in:

   ```
   {% photo "images/capitol-steps.jpg", "Describe what's in the photo, for people who can't see it" %}
   ```

---

## 7. Special situations

### The venue changes

Edit **section 4** of `site-details.yaml`: `name`, `city`, `address`, and `note`. Also update `check_words` to a word that belongs only to the new venue. Every page updates automatically.

### The American Legion emblem is approved

1. Upload the emblem image to `src/images`.
2. In **section 11** of `site-details.yaml`, set `image: "images/your-file-name.png"` and `approved: true`.

### The site officially launches

1. In `site-details.yaml`, change `prototype: true` to `prototype: false`. That removes the "Prototype" banner and lets Google list the site.
2. Once the web address (domain) is set up, put it in `website_address`. Setup steps are in `docs/DEPLOYMENT.md`.

### Adding a contact person

In **section 7** of `site-details.yaml`, copy the four lines that start at `- name:` and paste them underneath, keeping the same spaces. Only list a phone number or email with that person's permission.

---

## 8. If something goes wrong

**A red X in the Actions tab:** click it, then click **build**, then open the step called **Check site details and build**. The message says what's wrong and which line to fix, for example:

```
The website was NOT built. Please fix this problem:
  - session: start_date should be a date written YEAR-MONTH-DAY, like 2027-04-15.
```

Fix the file the same way you edited it, and the site rebuilds.

**Undoing a change:** open the file on GitHub and click **History**. It lists every saved version. Open an older version, copy its text, and paste it back in.

**Still stuck?** `docs/FOR-DEVELOPERS.md` explains how the site works for anyone with coding experience.

---

## 9. What's still missing

`docs/TODO.md` lists every piece of missing information, both the notes in `site-details.yaml` and the yellow `[TODO]` placeholders on each page.

---

### Optional: previewing on your own computer

You can always edit on GitHub. If you'd like to preview changes before they go live:

1. Install **Node.js** (the "LTS" version) from nodejs.org.
2. Download the project (on GitHub: **Code → Download ZIP**, then unzip it).
3. Open a terminal in the project folder and run `npm install` (only needed the first time), then `npm start`.
4. Open http://localhost:8080 in your browser. The preview updates as you save files.

To refresh the list in `docs/TODO.md`, run `npm run todo -- --write`.
