# Rush IT 0.3 — connected freight and execution

## Delivered

- New responsive navy/teal operating shell, collapsible navigation, command search (Ctrl/Cmd K), light/dark mode, purposeful empty states and contextual actions.
- Real dashboard state counts, queue, driver workload/shift status, event timeline and deadline risks. Risk panel explicitly covers the latest 100 accessible jobs; state totals cover all accessible jobs.
- Server-side job search across references/IDs, customer, driver, stop addresses/suburbs/company, freight identifiers/parties and package barcodes. State/history date filters and eight sort modes. Distinct live, unassigned, in-progress, completed, exception and historical views.
- Persistent freight consignments with distinct AWB/MAWB/HAWB, commercial parties, route/terminal/depot/warehouse fields, flight/release/customs metadata and special handling. Package rows with centimetre dimensions, gross weight and server-calculated totals. One job can link multiple consignments.
- Actual local PDF text reading and Tesseract image OCR. Original PDF/JPG/PNG stored encrypted; ten-page/five-megabyte limits, bounded worker time/memory and concurrency. Label-based field extraction retains source snippets. Required human verification precedes saving. Quality indicators are heuristic, not calibrated AI confidence. Arbitrary tabular document layouts can require manual correction.
- Two-panel document review with an image viewer or authenticated original PDF link, recognised text and editable fields. Reviewed pieces, weight and dimensions prefill package inputs. Cargo can link to an existing booking or create and link a new booking atomically.
- Assigned driver pickup/delivery package scans, wrong-job/unknown/duplicate/version checks, scan progress and scan-gated pickup. Retries preserve immutable historical scans and require fresh scans for the new attempt.
- Manual/hardware scanner input; optional browser BarcodeDetector camera reading with explicit start/close and manual fallback. Camera compatibility requires physical-device testing.
- Driver batch arrival/pickup actions with independent per-job validation/results. Batch delivery is deferred because evidence is captured per job.
- Successful delivery through a dedicated POD command, requiring recipient, visible signature, valid image envelope and all delivery scans. GPS is required when the selected policy requires it. Encrypted evidence includes policy requirements and scan references, plus actor/time/notes. Completed jobs expose evidence and their recorded timeline.
- Persistent base/driver messages, priority, job links, scope checks and read receipts. Structured five-item driver declaration is required to start a shift. End-shift request/dispatcher approval checks remaining work and revokes driver sessions.

## Evidence

32 automated tests pass, including real PDF reading and OCR and the complete document → review → cargo → job → assignment → shift → scans → delivery/POD → history path. Permission, tenancy, stale revisions, idempotency, failed attempts, rollback, message receipts and shift closure are covered.

Browser checks: authenticated user dashboard; document upload/real recognition, field verification, saved cargo, calculated volume and cargo-aware booking in a separate in-memory test workspace; linked job/source-document/package display; laptop (1366 × 900), phone (390 × 844) and dark mode. Synthetic test data never entered the user's persistent database. Camera permission/real-device decoding and full driver touch-signature UI remain physical-device acceptance work; API execution/POD is integration-tested.

## Explicit remaining work

Live maps/continuous tracking/geofencing and traffic-based routing; postcode/distance/route/manual sequence sorting; drag-and-drop dispatch; vehicles/fleet/routes; broadcast/message attachments/acknowledgement policies; customer account workflows and additional customer/contact/location editors; configurable POD alternatives/OTP/exception policies; multi-leg/returns; batch delivery evidence; native mobile/offline queue/conflict resolution; reporting/billing/exports; production PostgreSQL migrations and permission catalogue; SSO/MFA/invitations/recovery; managed encryption keys/private object storage/temporary signed links; malware screening, retention and production approval.

This is a substantial working local release, not a claim that every master-prompt requirement is implemented or commercially production approved. Runtime storage is still SQLite. Original documents/evidence are encrypted with AES-256-GCM and a local ignored key; metadata, cargo fields and extracted text are scoped SQLite records and are not field-encrypted. Production keys must be independently managed. Original documents use authenticated, tenant-scoped access rather than publicly accessible or presigned object URLs.

## Review and run

Desktop review project: `C:\Users\RusheetBhatta\Desktop\RushITDriver`.
App: `http://localhost:4174/`. Existing authorised login remains unchanged.
New checkout: Node 24.14+, `npm ci`, `npm run setup`, `npm start`. Tests: `npm run check` and `npm test`.
Back up the entire ignored `.data` directory, including the document key, together with the database before production-style migration or restore work. Losing the key makes document/POD ciphertext unreadable.
No staging, commits, pushes or deployment were performed.

## Implementation inventory

Schema: additive local tables in `apps/api/schema.sql`; the earlier PostgreSQL proposal is not a migration for these new tables. API/services: `jobs.cjs`, `logistics.cjs`, `extraction.cjs`, `document-reader.cjs`, `server.cjs`. Interface: `premium.js`, `execution.js`, `premium.css` integrated with existing authentication/admin forms. Tests: `logistics.test.cjs` and isolated `browser-fixture.cjs`.

Extraction dependencies follow their primary documentation: [pdf-parse](https://www.npmjs.com/package/pdf-parse), [Tesseract local installation](https://github.com/naptha/tesseract.js/blob/master/docs/local-installation.md), [Tesseract API](https://github.com/naptha/tesseract.js/blob/master/docs/api.md).
