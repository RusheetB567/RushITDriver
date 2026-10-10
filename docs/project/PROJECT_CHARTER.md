# RushIT project charter

Date: 7 October 2026 · version 0.1 · status: DRAFT FOR PRODUCT OWNER REVIEW

This is the first Phase 0 deliverable. It establishes a proposed baseline; it is not a record of budget approval, appointed staff, completed UAT or permission to publish. Read alongside `PROJECT_BASELINE.md` for the supporting documents.

## Mandate and executive vision

Build an independent courier operating platform connecting customers, operations, drivers, physical packages, vehicles and delivery evidence. Operational benchmarks explain problems; they do not supply proprietary implementation, branding or designs. RushIT owns its product model and implementation.

The product must answer: who moved which package, from where to where, for which customer, on which assignment/vehicle, under which service/window, with which evidence, and what actually happened. The current browser/API foundation is an engineering asset, not a commercial release.

## Business outcomes

- One shared operational record reduces inconsistent dispatch/driver information.
- Validated scans and required evidence reduce shipment mistakes and disputes.
- Durable offline work prevents lost pickup/delivery records in poor reception.
- Explicit shifts and transparent tracking improve operational visibility and driver trust.
- Customer milestones reduce routine status enquiries.
- Auditable commands support investigation, exception resolution and future billing.

Pricing, settlements, national networks and analytics extend this domain after the operational release proves reliable.

## Initial pilot hypothesis

One courier organisation, one operational branch/depot, 5–30 drivers, metro pickup and delivery, one pickup and one delivery per job. This is a planning assumption from the brief's small-business scenario, not confirmed discovery. iOS and Android are target platforms. Use synthetic data until the privacy/security/pilot gates pass.

## Objectives and proposed measures

| Objective | Proposed acceptance measure | How measured |
| --- | --- | --- |
| Operational lifecycle | Every pilot scenario proceeds from booking to accepted POD or explicit exception | Driver/dispatcher UAT ledger |
| Evidence integrity | All configured missing-evidence cases rejected; zero unexplained lost records | Negative API tests and media integrity checks |
| Offline continuity | Complete assigned work during a 4-hour outage; survive app termination; reconcile without duplicate effects | Physical-device network-loss tests |
| Tenant isolation | No cross-organisation or unassigned-driver access in tested APIs/files/realtime | Security regression suite |
| Live visibility | Proposed 95% of connected assignments visible within 10 seconds | Correlated assignment/ack timestamps |
| Usability | Drivers and dispatchers complete agreed tasks without developer intervention | Recorded UAT sessions; targets set with pilot users |
| Release reliability | No unresolved critical operational/security defects; restore and rollback drills pass | Release gate evidence |

These are proposed targets, not achieved results. Define scale, networks, device matrix and measurement windows before using them as service commitments. Battery, crash-free session, latency and recovery targets are in the quality strategy.

## Scope and boundaries

Commercial MVP: organisation identity/permissions; operations booking/allocation; native driver shift and work execution; package identifiers and scans; policy-driven photo/signature/name/GPS/time evidence; failures/reattempts; live status; essential offline work/sync; dispatch map; secure tracking links; audit, basic reports and operational support.

MVP exclusion candidates: full pricing/quoting, accounting integration, complex multi-leg/linehaul, settlements, route optimisation, RFID, AI, warehouse management and bespoke BI. Pricing/billing remain required for the eventual platform but are not silently treated as completed MVP capabilities. If the selected pilot cannot operate without pricing or an accounting adapter, make that a release-scope change before implementation.

## Delivery approach

Use two-week planning windows with backlog refinement, implementation, review, tests, demonstration and retrospective. Sprint windows are relative until staffing/start date is agreed. Architecture, security, QA and readiness gates govern advancement. Tests and security work accompany features; they do not wait for a late testing phase.

Phase 0 establishes the charter, scope, stakeholders/RACI, assumptions/constraints, RAID, capability/process maps, journeys, MVP boundary, architecture alignment and delivery roadmap. Later documents elaborate architecture and production controls before their dependent code is built.

## Authority and ownership

Proposed sponsor and product owner: user, pending explicit designation. Named operational representatives, security/privacy reviewer, QA acceptor and support owner are unappointed. The development assistant prepares code, evidence and recommendations; it cannot certify business acceptance or appoint staff. See `GOVERNANCE.md` for responsibilities and review criteria.

User-controlled Git workflow persists: do not stage, commit, push, create PRs or publish automatically. Suggested Git text may be prepared for review.

## Constraints and assumptions

No approved budget, delivery date, provider accounts, pilot organisation, real-device test matrix or app-store organisation accounts have been supplied. The current local foundation uses JavaScript and SQLite; TypeScript, production PostgreSQL, migration tooling and complete permission configuration remain work. No authorised proprietary RTMS integration contract exists. No current screenshot proves native background or offline behaviour.

The Desktop `RushITDriver` checkout is the user review project. Prepare authorised changes in the workspace and copy only identified files, preserving Desktop Git history and runtime data. Never merge differing copies blindly.

## Success and closure

The project is successful when a real courier organisation operates the agreed release and pilot metrics/security/recovery gates pass. Screens and unit-test counts alone do not establish that. Commercial launch requires product owner acceptance plus named operations, QA/security and support readiness.

Phase 0 drafting is complete when all initiation artefacts exist and trace back to this brief. Baseline acceptance remains pending the user/product owner review; missing external decisions are visible dependencies, not fabricated approvals.

## Change control

Record requested change → impact on operations/security/data/cost/time → product decision → update requirements/backlog/architecture → implement and verify. Any change to core evidence, lifecycle, permissions, offline conflict or commercial MVP boundary requires a decision record. Do not use scope growth to erase previous acceptance criteria.

## Highest immediate risks

Offline/evidence loss; multi-tenant leakage; native location restrictions/battery; scope growth; missing migration/typed-contract controls; limited operational discovery; unassigned UAT/support ownership. Mitigations and gate dates are in `RAID_REGISTER.md`.

## Phase 0 exit record

Prepared: charter and supporting baseline documents. Pending: pilot confirmation, ownership assignments, acceptance of MVP boundary, provider/budget decisions and measurable UAT targets. No commercial go-live is authorised by this document.
