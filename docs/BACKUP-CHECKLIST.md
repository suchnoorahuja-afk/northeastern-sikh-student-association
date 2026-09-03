# Backup Checklist

Backups must be stored in access-controlled, organization-owned storage. Do not commit database exports, credentials, or member spreadsheets to GitHub.

## What to preserve

- GitHub repository and important branch/commit references.
- Supabase database export for `events`, `gazettes`, `eboard_members`, `member_archive`, `gallery_photos`, and `involvement_opportunities`, plus the administrative authorization data used by the project.
- Definitions for RLS policies, grants, `replace_events`, `replace_member_archive`, and relevant triggers/functions.
- Supabase Storage contents from `gazettes`, `eboard`, and `gallery`.
- Original Schedule and Member Archive workbooks used for each publication.
- Original Gazette PDFs and cover images.
- Original E-Board and Gallery images.
- A private ownership register for GitHub, Vercel, Supabase, registrar/DNS, recovery contacts, and backup locations.

## Practical schedule

- **Every semester and before officer turnover:** make a full code, database, policy/function, and Storage backup.
- **Before a full-dataset import, bulk delete, policy/RPC change, or major release:** make a dated backup of the affected data and files.
- **After important content publication:** retain the exact source workbook/PDF/images used.
- **At least once per semester:** test that a repository archive opens, an export can be read, and sample stored files download successfully.

## Backup record

For every backup, record the date/time, person responsible, environment/project, contents, storage location, encryption/access restrictions, and retention/removal date. Never record secret values in this repository.

## Restore readiness

1. Confirm two current officers can locate the backup and its instructions.
2. Restore into an isolated test project or safe local workflow when possible, never directly over production as a test.
3. Compare row counts and spot-check representative records and files.
4. Verify references between database rows and Storage objects.
5. Document gaps and repeat the backup if it is incomplete.

Supabase plan capabilities and dashboard export options can change. Current Supabase owners must verify the project's actual backup coverage, retention, and restore procedure in the dashboard rather than assuming it is automatic.

