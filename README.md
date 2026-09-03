# Sikh Student Association at Northeastern website

This repository contains the public website and private content-management area for the Sikh Student Association at Northeastern (SSAN).

- Production: https://www.northeasternsikhs.org
- Admin: https://www.northeasternsikhs.org/admin
- Stack: React, Vite, React Router, Supabase, Vercel, and GitHub

Public pages include Home, Schedule, E-Board, Sikh Gazette, Member Archive, Photo Gallery, Get Involved, and About. Authorized officers manage content through Admin.

## Read this before making changes

> **Do not casually change Supabase Row Level Security (RLS), RPC functions, Storage policies, authentication, DNS/domain settings, Vercel environment variables, or `.env.local`.** A mistake can expose private operations or take the site offline.
>
> Schedule and Member Archive publishing replace the complete live dataset. Inspect the preview and keep a backup of the current source workbook before publishing.

Hiding Admin controls is not database security. Supabase policies and function permissions must enforce authorization independently. Follow the [Supabase security checklist](docs/SUPABASE-SECURITY-CHECKLIST.md).

## Maintainer guides

- [Admin operations](docs/ADMIN-GUIDE.md)
- [Deployment and ownership](docs/DEPLOYMENT-AND-OWNERSHIP.md)
- [Backup checklist](docs/BACKUP-CHECKLIST.md)
- [Supabase security review](docs/SUPABASE-SECURITY-CHECKLIST.md)

## Required software and local setup

Install Node.js with npm, Git, and an editor. Use a current Node version supported by the Vite version in `package.json`.

1. Clone the repository and open its folder in a terminal.
2. Install the locked dependencies with `npm install`.
3. Create `.env.local` using the variable names below. Obtain values from an authorized maintainer; never commit or send them in chat.
4. Run `npm run dev` and open the local URL printed by Vite.

Before proposing a production change, run:

```sh
npm run lint
npm run build
```

`npm run build` creates the ignored `dist/` directory. `npm run preview` previews that production build locally.

## Environment variable names

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

The publishable key is intended for frontend use; security comes from Supabase policies. Never expose a service-role key in this project or a `VITE_` variable. Keep local values in `.env.local` and production values in Vercel. Never place values in documentation, screenshots, issues, or messages.

## Git and GitHub workflow

1. Pull the latest approved branch.
2. Create a short-lived branch when practical.
3. Make one scoped change and review `git diff`.
4. Run lint and build.
5. Commit clearly and push the branch.
6. Have another maintainer review important work.
7. Merge to the configured production branch only after checks pass.

Do not commit `.env.local`, credentials, downloaded backups, or member workbooks containing personal information.

## Vercel deployment

Vercel is connected to Git. A push or merge to its configured production branch triggers production; other branches may create previews. Confirm the actual branch and ownership in Vercel rather than assuming them.

After deployment, confirm Vercel reports success, open several production routes directly, test mobile navigation and the changed feature, and verify `/robots.txt`, `/sitemap.xml`, and `/ssan-social-share.png`. If faulty, restore a known-good Vercel deployment or revert the Git commit and redeploy. See the [deployment guide](docs/DEPLOYMENT-AND-OWNERSHIP.md).

Do not change `vercel.json`, domains, DNS, or Vercel variables without a second organization administrator and a rollback plan.

## Supabase overview

Supabase provides authentication, database content, replacement RPCs, and public content files. The project refers to:

- Tables: `events`, `gazettes`, `eboard_members`, `member_archive`, `gallery_photos`, `involvement_opportunities`
- Administrative table to verify manually: `admin_users`
- RPCs: `replace_events`, `replace_member_archive`
- Storage buckets: `gazettes`, `eboard`, `gallery`

No service-role credential belongs in this frontend. Before changing a policy or function, export its current definition and obtain a second review.

## Content managed through Admin

- **Schedule:** upload and replace the schedule from Excel.
- **Sikh Gazette:** upload PDFs; the browser creates a first-page cover.
- **E-Board:** add, edit, reorder, and remove members/photos.
- **Member Archive:** upload and replace former-member data from Excel.
- **Photo Gallery:** upload, reorder, and remove photographs.
- **Get Involved:** add, edit, order, close, and remove opportunities.

See [ADMIN-GUIDE.md](docs/ADMIN-GUIDE.md) for detailed steps.

## Excel templates

- Member Archive: `public/SSAN-Member-Archive-Template.xlsx`
- Schedule: downloaded from Schedule Admin

The Member Archive workbook must keep `Member Archive` as worksheet one and `Roles` as worksheet two. Public fields are Name, Role, Graduation Year, Phone Number, Email, and LinkedIn. Phone Number maps to legacy field `contact_info`; do not rename it casually.

Both publishers replace the current dataset. Save source workbooks in controlled organization storage before publishing.

## Branding, metadata, and crawler files

- Main logo: `public/nssa-logo.png` (legacy filename intentionally retained)
- Social image: `public/ssan-social-share.png`
- Favicons/app icons: `public/`, referenced by `index.html` and `site.webmanifest`
- Sitemap: `public/sitemap.xml`
- Crawler rules: `public/robots.txt`
- Route metadata: `src/components/RouteMetadata.jsx`

When adding/removing a public route, update the router, route metadata, navigation when appropriate, and sitemap together.

## Safe and high-risk areas

Generally safe when reviewed and tested: user-facing text in `src/pages/`, focused CSS edits, documentation, coordinated public branding assets, and Admin content updates made after backups.

Do not casually modify `.env.local`, Vercel variables, `src/lib/supabase.js`, Supabase RLS/grants/RPCs/Storage/Auth, `vercel.json`, DNS/redirects/registrar settings, database names, `package-lock.json`, bulk replacement behavior, or referenced asset filenames.

## Troubleshooting

### Local site does not start

- Confirm Node/npm are installed and run `npm install` from the repository root.
- Confirm `.env.local` contains both required names.
- Restart Vite after environment changes.

### Public content is empty or errors

- Inspect browser console/network errors without sharing credentials.
- Confirm Supabase project settings and service status.
- Verify public SELECT policies. Do not weaken RLS just to remove an error.

### Admin login fails

- Confirm the user has an individual approved account.
- Ask a current Supabase administrator to verify Auth and admin authorization.
- Never share passwords or use one common officer password.

### Upload/publish fails

- Read the full error; check type, size, workbook structure, and internet access.
- Refresh Admin and verify whether content is already live before retrying.
- For an orphaned-file warning, ask an administrator to inspect only the named bucket/path.

### Deployment fails

- Read the Vercel log and reproduce with `npm run build`.
- Confirm required variable names exist for production.
- Restore the previous deployment or revert the faulty commit if users are affected.
