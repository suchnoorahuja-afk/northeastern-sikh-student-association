# SSAN Admin Guide

This guide is for authorized Sikh Student Association at Northeastern officers managing website content at `https://www.northeasternsikhs.org/admin`.

## Sign in safely

1. Open the Admin URL directly and sign in with your individual account.
2. Never share passwords or use a shared officer login.
3. Confirm you are on `northeasternsikhs.org` before entering credentials.
4. Sign out when using a shared device.

If access is denied, ask a current Supabase organization administrator to verify both the Auth account and administrative authorization. Do not ask anyone to disable security policies.

## Before changing content

- Save the current source workbook or other source material in organization-owned storage.
- For a replacement import, review every preview row before publishing.
- Keep only one Admin tab open while editing.
- After saving, refresh the corresponding public page and check desktop and mobile layouts.

## Schedule

1. Open **Schedule** and download the current template if needed.
2. Complete the workbook without renaming its expected columns.
3. Upload it, read validation messages, and inspect the preview.
4. Publish only when the preview is complete and correct.

Publishing replaces the complete live schedule. If it fails, do not repeatedly publish. Read the error, retain the workbook, refresh the public Schedule page, and determine whether the previous schedule is still live.

## Sikh Gazette

1. Open **Sikh Gazette** and select the issue PDF.
2. Enter the requested issue information.
3. Wait for the generated first-page cover and inspect it.
4. Publish once, then open the issue from the public Gazette page.

Use an accessible, reasonably sized PDF. If upload fails, check the file type/size and connection. Refresh before retrying to see whether a database record or file was already created. Report any orphaned-file warning to a Supabase administrator with the exact bucket/path shown.

Deleting an issue removes its public record and attempts to remove associated files. Confirm you selected the correct issue and retain the original PDF first.

## E-Board

Use **Add member** or **Edit** to maintain name, role, biography, links, and photo. Use the arrow controls to set public order. Check portrait cropping on both phone and desktop after saving.

Deleting a member is permanent and may also remove the stored photo. Keep the original image and confirm the name in the prompt before proceeding.

## Member Archive

1. Start from `public/SSAN-Member-Archive-Template.xlsx`.
2. Keep **Member Archive** as the first sheet and **Roles** as the second.
3. Preserve the expected fields: Name, Role, Graduation Year, Phone Number, Email, and LinkedIn.
4. Upload, resolve validation errors, inspect the preview, then publish.

Publishing replaces the complete archive. Store the prior workbook before publishing. Treat phone numbers and email addresses as personal information and keep workbooks in access-controlled organization storage.

## Photo Gallery

Upload an appropriate image, add a concise caption/alt description where requested, and save. Use the arrow controls to change display order. Check the public gallery after uploading.

Deleting a photo is permanent and may remove the storage object. Keep the original file, verify the thumbnail/caption, and confirm only once.

## Get Involved

Add or edit the title, description, link, deadline/status, and other requested details. Use the arrow controls to set public order. Close an opportunity when applications should stop without removing its history; delete only when the listing should be removed entirely.

Test every submitted link in a new tab. Do not publish private forms, edit links, or documents that require unintended permissions.

## When something goes wrong

- Copy the exact error text and note which action/file caused it; never include passwords or keys.
- Refresh the public page before retrying a save, upload, or delete.
- Do not weaken RLS, Storage policies, or authentication to bypass an error.
- Escalate repeated failures to a technical maintainer with the time, browser, action, and safe screenshot.
- For accidental replacement/deletion, stop editing and use the latest backup and deployment/ownership contacts.

