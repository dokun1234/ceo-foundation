# C.E.O Foundation - Official 6-Page Website

**Centre of Empowerment Organisation (`C.E.O Organisation`)**
*Empowering People. Inspiring Growth. Transforming Communities.* | **Every Child Deserves a Chance**

## Unified 6-Page Architecture

All 6 pages share one unified C.E.O Foundation NGO design system (`css/styles.css` + `js/app.js`), identical global topbar/navbar/footer navigation, and verified documentary photography. ScrollCraft (`scrollcraft.css` + `scrollcraft.js`) is applied surgically **only on `index.html`** (subtle 3-plane hero depth + 1 interactive pinned `LEARN -> LEAD -> SERVE -> IMPACT` showcase), while all 5 inner pages use 100% natural, un-pinned scrolling.

```text
ceo-foundation/
├── index.html                 # Home: Dimensional hero + 1 surgical ScrollCraft pinned story + executive previews
├── about.html                 # About Us: Founder's verbatim Inspiration essay, Vision, Mission & 7 Core Values
├── programs.html              # Programs & Outreach: 10 Focus Areas, 6 Pillars, 1199 Helpline & 7-photo Gallery
├── leadership.html            # Leadership: Bethel Ruiru field banner, 9 Leaders deep-dive modal & 6 official posters
├── membership.html            # Membership: 4 Pathways, 10 Benefits, 10 Expectations & WhatsApp/Email Fast-Track Form
├── donate.html                # Donate & Partner: KES/USD Impact Calculator, M-Pesa/Email copy & Stewardship commitments
├── scrollcraft.css            # Untouched ScrollCraft device floor (loaded on index.html)
├── scrollcraft.js             # Untouched ScrollCraft runtime (loaded on index.html)
├── css/
│   └── styles.css             # Unified C.E.O Foundation Design System across all 6 pages
├── js/
│   ├── data.js                # Central configuration, 9 Leadership Profiles, Programs, Values, Pathways & Tiers
│   └── app.js                 # Unified multi-page navigation, deep-link hydration, modals, calculator & ScrollCraft tabs
└── assets/
    ├── images/
    │   ├── logo-icon.png      # Official transparent C.E.O emblem
    │   ├── logo-full.png      # Official vertical transparent logo
    │   ├── hero/              # 3-plane WebP dimensional hero layers (far plate, focal subjects, foreground frame)
    │   ├── leaders/           # Clean cropped portraits of executive leaders
    │   ├── outreach/          # Authentic community outreach & children's welfare photos
    │   └── posters/           # Full-resolution official Leadership Profile posters
    └── docs/
        ├── CEO_Foundation_Organisation_Profile.pdf
        └── CEO_Foundation_Leadership_Profiles.pdf
```

## Quick Customization (`js/data.js`)

All contact details, optional external Google Form links, leadership profiles, membership pathways, and impact calculator tiers live in [`js/data.js`](./js/data.js) under `window.CEO_CONFIG` and `window.CEO_DATA`:

- **`googleFormUrl`**: Paste your Google Form URL if you want the Membership form submit button to redirect directly to a Google Form instead of WhatsApp Fast-Track.
- **`phoneDisplay` / `phoneRaw` / `email`**: Update phone (`+254 116 257654`) or email (`ceoorganisation7@gmail.com`) contacts in one place.

## Running Locally

```powershell
python -m http.server 8080 --directory "C:\Users\ADMIN\.gemini\antigravity\scratch\ceo-foundation"
```

Open `http://localhost:8080` in your browser.

## Deployment

- **Netlify / Vercel / Cloudflare Pages**: Connect or upload the `ceo-foundation` folder directly (zero build step required; publish directory is `.`).
- **Kenyan cPanel Hosting (Truehost, HostPinnacle, Sasahost)**: Upload the contents of `ceo-foundation/` (excluding `node_modules` / `package*.json` used for local Playwright QA) directly into `public_html/`.
