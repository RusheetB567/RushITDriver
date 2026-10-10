# Current release — 8 October 2026

Rush IT 0.3 now implements cargo consignments/packages, local PDF/OCR review, job linking, pickup/delivery scans, encrypted signature/photo POD completion, messages, safety declarations and base-approved end-shift requests. See [current premium release](project/PREMIUM_RELEASE.md) for delivered features, 32 passing tests, browser evidence and remaining scope.

The following foundation milestone is historical; its delivery/evidence limitations are superseded by 0.3. Production gates still apply.

# Implementation status — 7 October 2026

## Delivered in this milestone

- All 27 first-task architecture deliverables: `PRODUCT_ARCHITECTURE.md`.
- Normalised executable development schema and proposed PostgreSQL production schema.
- Modular API with file-backed SQLite, scrypt password hashing, hashed server sessions, expiry/logout, login rate limits and write origin checks.
- Organisation admin, dispatcher and driver roles enforced server-side; driver job queries limited to active assignments.
- Booking with structured pickup/delivery legs, contacts, instructions, windows, priorities, customer/policy and shipment.
- Assignment/reassignment before travel, explicit server state machine and optimistic revisions.
- Idempotency records in the same transaction as job commands, domain events, audit and outbox.
- Shift start/break/resume/finish, with active-work gate on finish.
- Failed attempts and dispatch-authorised reattempts retaining history.
- Optional event GPS samples with coordinate/freshness checks, without claiming background tracking.
- Scoped SSE invalidation, authenticated web client, user creation and audit/availability views.
- Independently branded responsive design with system light/dark mode, accessible labels, focus indicators and reduced-motion behaviour.
- Original localStorage prototype retained behind `npm run prototype` only.

## Validation

Automated tests cover hashing/login, role boundaries, cross-organisation access, assignment visibility, bad-input rollback, duplicate replay, stale versions, state ordering, shift gating, failed attempts, GPS validation, CSRF/origin checks, immutable audit/events, realtime invalidation and logout revocation. File persistence is tested separately through database close/reopen.

Rush IT branding, mobile sign-in at 390 × 844, authorised administrator login, dashboard access, sign-out and privacy notice were verified in the browser on 8 October 2026. Twenty automated tests pass. Other authenticated web workflows have API integration coverage; full browser/device workflow verification remains required. Proposed PostgreSQL DDL has not been run against a PostgreSQL instance.

## Explicitly not delivered yet

Native iOS/Android shell; secure offline cache/queue/conflict handling; object-store uploads; barcode camera decoding/package matching; pickup evidence requirements; rules-driven POD acceptance; successful delivery completion; PIN/OTP; continuous shift-based tracking/geofencing; fleet map; push; messaging service; customer booking/tracking; route optimisation; multi-leg execution/returns; vehicle/incidents/wait timers; full branch/account permissions; rates/billing/reports/exports; cloud deployment and operational hardening.

Successful delivery is blocked until the evidence milestone. Pickup in this foundation records the operational transition but does not yet enforce scan/photo policies; do not use it for real consignments. SSE publishes live invalidation directly after commit; outbox rows are durable, but an outbox replay worker is not implemented. Clients recover with fresh reads, not a durable realtime cursor.

## Production gates

TLS/Secure cookies, OIDC/MFA/recovery, rotating mobile credentials, account invitations, session/device management, encrypted device data, PostgreSQL runtime adapter/RLS validation, distributed rate limits, evidence malware checks/object access, retention policies, observability, backups/restore, real-device background tests, load testing and independent security review. Current server binds only to loopback. Do not expose it to the internet.

## Next implementation milestone

Build private evidence storage and the versioned POD policy engine, package/barcode records and verified pickup requirements, followed by native driver foundations and durable offline commands. Avoid expanding visible UI until its command/query services exist.

All files remain uncommitted. The Desktop project is the user's review copy; workspace code is mirrored there without replacing its Git metadata or local database.
