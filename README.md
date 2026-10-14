# Rush IT — Courier Operating System

Independent courier platform under phased development. Nothing is staged, committed or pushed automatically. Git origin: https://github.com/RusheetB567/RushITDriver.git.

## Start Rush IT 0.3

Requires Node.js 24.14 or later. Install the locked dependencies for PDF parsing and local OCR.

```powershell
cd C:\Users\RusheetBhatta\Desktop\RushITDriver
npm run setup
npm run dev
```

Setup asks for your organisation, administrator name/email and a password of at least 12 characters. Password input is hidden and only a salted scrypt hash is stored. There are no fixed accounts or demo passwords. Setup will not overwrite an existing account.

For your existing configured project, skip setup and run `npm run dev`. This starts the authenticated application at http://localhost:4174 with automatic server restart when source files change. `npm start` runs the same application without watch mode. Keep the terminal running; press Ctrl+C to stop it.

Open http://localhost:4174. Add driver and dispatcher accounts under **People & access**. Create a booking, choose its customer and POD policy, fill pickup/delivery and shipment details, then allocate it to a driver. Sign out and sign in as the driver, start a shift, and progress through acceptance, travel, pickup and delivery arrival. Failed delivery and dispatch-authorised reattempts are supported. Link reviewed cargo, scan its packages at both stops, then capture recipient, signature and photograph to complete delivery. Document intelligence reads PDF/JPG/PNG locally and requires review before saving cargo.

Users on the same computer can use separate browser profiles to review driver/dispatch simultaneously. The server binds to loopback; cross-device/network deployment is not configured.

## Validate

```powershell
npm run check
npm test
```

Tests run in one process, including real HTTP integration requests to an isolated test database, permission attacks, idempotency, revision conflicts and restart persistence. Test credentials exist only in test fixtures. Test data is separate from your `.data/rushit.sqlite` database.

## Review the architecture

- [Premium release, validation and remaining capabilities](docs/project/PREMIUM_RELEASE.md)
- [UI audit and upgrade design](docs/project/PREMIUM_UPGRADE.md)

- [Complete product architecture and 27 first-task deliverables](docs/PRODUCT_ARCHITECTURE.md)
- [Implementation status and remaining production gates](docs/IMPLEMENTATION_STATUS.md)
- [Proposed production PostgreSQL schema](docs/POSTGRES_SCHEMA.sql)
- [Executable development schema](apps/api/schema.sql)
- [Screenshot evidence catalogue](docs/screens/SCREEN_CATALOGUE.md)
- [Earlier platform specification](COURIER_PLATFORM_SPECIFICATION.md)

## Structure

`apps/api/`: modular authentication, HTTP, persistence, validation and job engine.

`apps/web/`: authenticated driver, dispatch and admin web foundation.

`packages/domain/`: explicit job workflow.

`tests/`: integration/security/domain checks.

`public/`: original disposable browser prototype, available separately with `npm run prototype` at http://localhost:4173. It uses synthetic localStorage data and simulated accounts. Its POD/signature demo is not part of the authenticated foundation and cannot serve as production evidence handling.

`.data/`: ignored local database and document encryption key. Back up both together. Do not upload database files or real operational evidence to GitHub.

## Current limitations

This milestone establishes persistent accounts and jobs, server-side organisation/assignment permissions, sessions, audited transitions, shifts and live web invalidation. It is not a complete native mobile product or a production deployment. SQLite is a local development adapter; the proposed PostgreSQL schema has not been applied. Offline secure sync, managed object storage/key management, native background GPS, physical-device camera acceptance, customer portals, maps, routing, billing and reports remain scheduled work. Enabled foundation controls connect to implemented services; unavailable features are stated explicitly.

Use synthetic data during review. Production TLS, OIDC/MFA/recovery, encryption/retention, managed infrastructure, full monitoring and device testing must be completed before real courier use.

## Project governance and privacy review

See [Phase 0 project baseline](docs/project/PROJECT_BASELINE.md) and [compliance/privacy baseline](docs/compliance/COMPLIANCE_BASELINE.md). Both distinguish draft assessments, implemented controls and production approval gaps. Rush IT is the confirmed interface name; the GitHub repository and Desktop folder retain RushITDriver.

# Enterprise delivery baseline — 10 October 2026

The latest enterprise brief requires architecture and project planning before further major feature implementation. Start with the [Enterprise Solution Blueprint](docs/project/ENTERPRISE_SOLUTION_BLUEPRINT.md), [code readiness and 95-item coverage assessment](docs/project/ENTERPRISE_READINESS.md), and [Sprint 0–2 backlog](docs/project/ENTERPRISE_BACKLOG.md). These are draft design artifacts, not production approval or claims that the proposed services exist. The local application remains version 0.3.0.

## Live fleet map — 14 October 2026

The operations sidebar now includes Live fleet map. It polls tenant-scoped latest driver positions every 10 seconds, supports driver selection/search and map zoom, and shows shift availability, active workload, sample age and accuracy. Markers become stale after 90 seconds; no simulated drivers or fabricated ETAs are supplied. OpenStreetMap tiles require internet and are suitable for this local review; production provider selection remains open.

Drivers explicitly choose Share my location during an Available shift. Browser permission is required. Tracking works only while the browser page remains open; mobile background tracking is not implemented. Stop sharing removes the latest stored point. Off-shift/on-break coordinates are hidden and new samples are rejected. Only the latest position is retained, not a historical movement trail. Physical-device GPS and cross-device deployment remain acceptance work. The server is loopback-only, so a phone cannot connect to this local URL yet.

Verification: 33 automated tests pass, including location role/tenant/shift validation, stale sample rejection, monotonic updates and removal. App, health endpoint and fleet assets return HTTP 200. Browser visual verification was blocked by the browser URL policy, so no screenshot or real-device tracking claim is made.
