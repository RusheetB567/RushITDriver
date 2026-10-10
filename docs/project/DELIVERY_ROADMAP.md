# Product backlog, sprint/release roadmap and quality gates

Planning baseline only. Two-week sprint windows start after scope/capacity is agreed; no committed delivery date, effort estimate, assigned team or budget exists. Security/QA/discovery continue throughout.

| Backlog ID | Slice / linked requirements | Dependency | Acceptance deliverable | Target / status |
| --- | --- | --- | --- | --- |
| B00 | Phase 0 charter/governance/research/requirements | Supplied briefs and code review | Reviewable baseline; PO decision log | Current / PARTIAL (drafted; review pending) |
| B01 | Migration harness and typed contracts / NFR03 | Architecture review | Fresh and upgrade DB tests; validated shared payloads; quality gates | Window 1 / NOT STARTED |
| B02 | Permission grants and identity/session hardening / SEC01–03 | B01, provider decisions | Negative role/scope tests; revocation; secure recovery/device plan | Window 1–2 / PARTIAL |
| B03 | Packages/barcodes and custody / FR04/08 | B01, freight discovery | Correct/wrong/duplicate/unknown/missing/extra tests | Window 2 / NOT STARTED |
| B04 | Private evidence and upload finalisation / FR12 | B01/B02, storage/retention | Scoped file retrieval, checksum/type/size checks, upload recovery | Window 2–3 / NOT STARTED |
| B05 | Versioned pickup/POD policies and accepted completion / FR09/10/13 | B03/B04 | Missing evidence rejected; valid completion/replay/audit UAT slice | Window 3 / NOT STARTED |
| B06 | Native driver shell/shift/vehicle/scan/capture / FR07/08, UX01 | Auth/contracts and device matrix | iOS/Android physical-device capture/workflow tests | Window 3–4 / NOT STARTED |
| B07 | Offline command/media queue and conflicts / FR14/15 | B03–06 | Outage/termination/reassignment/partial-upload test pack | Window 4–5 / NOT STARTED |
| B08 | Durable outbox/reconnect/push/message / FR16/19 | Accepted commands, provider choices | Restart delivery, reconnect, scope/ack tests | Window 5 / NOT STARTED |
| B09 | Shift location/presence and fleet map / FR17/18 | B06–08, approved GPS policy | Real battery/background/staleness/privacy tests | Window 5–6 / NOT STARTED |
| B10 | Structured exceptions/reattempt/operational reports / FR11/21 | B03–05, operations | Failed-attempt custody/reconciliation UAT | Window 6 / PARTIAL |
| B11 | Public tracking and permitted POD view / FR20 | SEC02, B05, privacy review | Token expiry/revocation and minimum-data exposure tests | Window 6 / NOT STARTED |
| B12 | Staging/monitoring/backup/restore/support / NFR02 | Hosting/owners and working slices | Restore/rollback/escalation evidence | Throughout; gate 3 / NOT STARTED |
| B13 | UAT/load/security/pilot/store release / NFR01/04, COMP01 | B01–12 and gate owners | Operator sign-off, device/load/security/PIA gate evidence | Gate 3–4 / NOT STARTED |
| B14 | Customer self-service, pricing/accounting / FR22/27 | Pilot finance decision | Scoped customer booking/quote and reconciled charges | Phase 2 / NOT STARTED |
| B15 | Fleet/incidents/custom forms/returns/routes / FR23–26 | Discovery and core domain | Per-feature acceptance and custody/policy tests | Phase 2 / NOT STARTED |
| B16 | SaaS/SSO/SCIM/integrations/analytics/AI / FR28–30 | Proven deployment and scale evidence | Enterprise tenancy/load/advisory and provider gates | Enterprise / NOT STARTED |

Windows describe dependency order, not a promise that one assistant can finish the platform in twelve weeks. Estimate actual effort and parallel team capacity after discovery; replan when a gate fails. The user's Git control remains in effect.

## Test and observability strategy

For every slice: domain invariants → repository/migration tests → HTTP permission/validation/replay tests → web/native interaction → failure/recovery → operator UAT. Run critical regression suites on proposed changes. Add lint/strict typing/build, dependency/secret scanning and staging integration checks when tooling is configured. Current syntax checks are not lint or a security scan.

Critical offline pack: PLAN-OFF01 network lost at pickup; OFF02 lost during POD; OFF03 app killed before sync; OFF04 duplicate retries; OFF05 two devices/stale assignment; OFF06 interrupted image transfer; OFF07 partial event/media acknowledgement and expired auth. Verify local durable state and canonical server ledger, not only UI text.

Quality signals: action receipt/ack latency; request errors/latency; replay/conflict/queue backlog; media failures; stale tracking; crash-free sessions and battery; customer-notification failures; tenant access denials; database/worker health. Redact credentials/recipient media; correlate request/event IDs. Measurement must be implemented before claiming target achievement.

Pilot UAT: dispatcher books/allocates; driver starts shift/collects/delivers; client sees scoped milestones; dispatcher handles failed attempt; offline run recovers; shift finish stops tracking; support investigates without DB edits. PO/operations record acceptance or defects against requirement IDs.

## Infrastructure/CI strategy

Separate local/development/test/staging/production identities, databases and storage. Use least-privilege app/migration roles, managed secrets, private evidence storage and TLS. Provision with reviewed infrastructure code after provider/region/budget decisions. Production credentials never enter local fixtures or source. Development SQLite needs migration tests and a separate PostgreSQL implementation path.

Proposed pipeline: user-created commit/PR → strict contracts/lint/syntax → unit/API/migration tests → dependency/secrets scan → build → staging integration/device package → reviewed staging deployment → QA/security/PO evidence → approved production release. No pipeline or cloud deployment is configured by this document.

## Production readiness checklist

- [ ] Scope/pilot owners/finance boundary approved; no unresolved operational release blockers.
- [ ] Backend/UI/native flows and tenant/assignment/customer/file permissions tested.
- [ ] Package custody, pickup/POD policy and evidence integrity/finalisation work.
- [ ] Offline recovery/conflict/media/device termination tests pass.
- [ ] Production migrations/DB role isolation and upgrade rollback strategy verified.
- [ ] Identity recovery/MFA/device revocation/TLS/secrets/upload controls assessed.
- [ ] Approved privacy/PIA/GPS/retention/notices/provider and store declarations exist.
- [ ] Maps/push/message/realtime reconnect and stale positions tested on devices.
- [ ] Agreed capacity/latency/battery metrics achieved with evidence.
- [ ] Logging/alerts/runbooks/restore/rollback/escalation coverage demonstrated.
- [ ] Real-user UAT/training and pilot acceptance recorded.
- [ ] Release/version/store signing and controlled rollout reviewed.

## Support, incident and recovery

Support inspects scoped job/device/sync/notification/audit records through tools; ordinary support does not require DB writes. SEV1 widespread operational outage/security loss; SEV2 major workflow unavailable; SEV3 limited operational defect; SEV4 minor issue. Named on-call/escalation and privacy assessment workflow must be agreed before pilot. Set RPO/RTO with sponsor; demonstrate restore of database and evidence associations, then validate accessible operational records and replay safety.

## Post-launch roadmap

Measure pilot friction, failed/repeated work, sync failures, POD compliance, first-attempt/on-time performance and dispatcher interventions. Prioritise reliability/usability defects first. Introduce pricing/customer self-service/returns/fleet and enterprise networks according to operator value. AI remains advisory and needs privacy/vendor/quality assessment before operational data use.
