# Supabase Security Review Checklist

This is a manual review checklist, not a claim that the current project is secure. Complete it in the Supabase dashboard with a second qualified reviewer before launch and after any authorization change.

## Core rule

Hiding `/admin`, buttons, or JavaScript in the frontend is not authorization. Anyone can inspect frontend code and call the Supabase API. RLS policies, grants, function permissions, Storage policies, and Auth must independently enforce every restriction. Never place a service-role key in frontend code or any `VITE_` variable.

## Intended access model to verify

| Resource | Anonymous/public user | Authenticated non-admin | Authorized admin |
| --- | --- | --- | --- |
| `events` | Read published site content only | Same public read only | Required content-management writes |
| `gazettes` | Read published issue metadata only | Same public read only | Required content-management writes |
| `eboard_members` | Read public profiles only | Same public read only | Required content-management writes |
| `member_archive` | Read only fields intentionally published | Same public read only | Required replacement writes |
| `gallery_photos` | Read published gallery data only | Same public read only | Required content-management writes |
| `involvement_opportunities` | Read public listings only | Same public read only | Required content-management writes |
| `admin_users` | No read/write | No access to other users; no self-promotion | Only narrowly required administration, preferably server-controlled |
| `replace_events` RPC | No execute | No execute | Execute only for authorized admins |
| `replace_member_archive` RPC | No execute | No execute | Execute only for authorized admins |
| `gazettes` bucket | Read intended public files only | Same public read only | Required upload/update/delete |
| `eboard` bucket | Read intended public images only | Same public read only | Required upload/update/delete |
| `gallery` bucket | Read intended public images only | Same public read only | Required upload/update/delete |

The frontend does not directly reference `admin_users`; verify whether current RLS policies, RPCs, claims, or other backend logic use it. If it is obsolete, do not delete it during this review—document it and plan a separately reviewed migration.

## Dashboard inspection

- [ ] RLS is enabled on every table exposed through the API.
- [ ] Public `SELECT` policies expose only intended public rows and columns.
- [ ] No anonymous or ordinary authenticated role can `INSERT`, `UPDATE`, or `DELETE` managed content.
- [ ] Admin policies use a trustworthy identity/authorization source and cannot be satisfied by editing client-provided fields.
- [ ] A user cannot add themselves to, modify, or enumerate `admin_users` unless explicitly required and authorized.
- [ ] Both replacement RPCs have reviewed ownership, `SECURITY INVOKER`/`SECURITY DEFINER` behavior, fixed safe `search_path` where relevant, input validation, and execute grants only for the intended admin role.
- [ ] Replacement RPCs cannot be called anonymously or by a signed-in non-admin.
- [ ] Each Storage bucket has explicit read and write policies matching the table above.
- [ ] Upload policies constrain bucket, path ownership/authorization, and file operations; update/delete cannot target another bucket or unintended paths.
- [ ] Auth redirect/site URLs contain only intended local, preview, and production origins.
- [ ] MFA, owner access, recovery methods, logs, and security alerts are reviewed for the Supabase organization.
- [ ] No service-role key or secret appears in Git history, Vercel client variables, screenshots, logs, or officer documents.

## Manual access tests

Use disposable test content and clean it up afterward. Capture expected/actual results without recording tokens.

### Signed out / anonymous

- Public pages can read intended content and public files.
- Direct insert, update, delete, RPC execution, and Storage upload/delete attempts are denied.
- `admin_users` cannot be read or modified.

### Signed in but not an admin

- Public reading still works.
- Direct content writes, both replacement RPCs, bucket writes/deletes, and admin-list access are denied.
- Manually visiting `/admin` does not grant backend abilities.

### Authorized admin

- Only the Admin operations required by the site succeed.
- Writes are limited to the expected tables/buckets and validated paths.
- Removing admin authorization immediately prevents subsequent privileged operations after session refresh/re-authentication.

Record the review date, project reference, reviewers, policy/function versions, test results, and remediation owner in a private security record. Re-run these checks after any Supabase, Auth, RPC, Storage, or admin-membership change.
