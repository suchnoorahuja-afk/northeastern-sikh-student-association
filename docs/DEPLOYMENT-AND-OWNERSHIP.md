# Deployment and Ownership Guide

The website must remain controlled by the Sikh Student Association at Northeastern, not by one student's personal accounts. Record current owners in a private organization handoff document and review them each semester.

## Required ownership

Maintain at least two current, trusted administrators with individual accounts and MFA for each service:

- **GitHub:** repository organization owners or appropriately scoped administrators.
- **Vercel:** team owners/admins, production project access, and billing/contact visibility.
- **Supabase:** organization/project owners who can manage Auth, database, Storage, and backups.
- **Domain registrar/DNS:** account owners with renewal, billing, recovery email, and DNS access.

Use an organization-controlled recovery email wherever possible. Store recovery codes and the ownership register in an approved password manager or other restricted organization system. Never put them in this repository.

## Normal deployment flow

1. Pull the current approved production branch and make a focused change.
2. Review `git diff`; run `npm run lint` and `npm run build`.
3. Obtain another maintainer's review for important changes.
4. Commit and push through the agreed GitHub workflow.
5. Confirm Vercel built the intended commit and reports a successful production deployment.
6. Open the homepage and changed routes directly in production; check a phone-sized viewport, navigation, links, and Admin only when relevant.
7. Confirm `/robots.txt`, `/sitemap.xml`, and `/ssan-social-share.png` remain reachable after metadata/domain changes.

Confirm the production branch and Vercel Git integration in the dashboards; do not rely on this guide as proof of their current configuration.

## Rollback

If production is broken, first use Vercel to promote/restore the last known-good deployment when authorized. Then revert the faulty Git change through the normal reviewed workflow and deploy the correction. For a data problem, stop Admin edits and restore using the documented Supabase/database/storage backup process; a code rollback does not restore deleted content.

Do not change DNS, domains, Vercel environment variables, Supabase policies, or database functions during an incident without a second administrator and a written rollback plan.

## Officer transition checklist

1. Inventory GitHub, Vercel, Supabase, registrar/DNS, organization email, and password-manager owners.
2. Add at least two incoming trusted administrators and require MFA.
3. Verify each incoming administrator can sign in and reach the correct organization/project.
4. Transfer billing, renewal, recovery, and security-alert contacts to current organization addresses.
5. Review environment-variable names and where values are stored without copying secrets into the handoff document.
6. Take the semester backup and perform the restore spot-check in the backup checklist.
7. Remove former officers' access promptly after the transition is verified, including Auth accounts and third-party sharing permissions where appropriate.
8. Record the date and the current responsible officers in the private ownership register.

