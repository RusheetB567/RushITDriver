# Rush IT — Enterprise foundation backlog

10 October 2026 · Proposed Sprint 0–2 sequence; not dated commitments

No invented estimates, staffed owners or approvals. Roles below describe accountability. Each story needs review against real operational workflows before scheduling. Dependency order is binding; sprint boundaries depend on capacity. Existing working local app remains available for review.

## Sprint 0 — Resolve contracts and highest-risk design

| ID / type | Deliverable and owner | Dependency | Acceptance evidence |
| --- | --- | --- | --- |
| S0-01 Product | Measure unique jobs/interactions, driver/device mix, freight and custody workflows; BA/SME | Operational access | Observed journeys, load samples, signed-off MVP exclusions and unknowns register |
| S0-02 Architecture | Complete ADR-001–018 decisions, cost/residency evaluation; architect | S0-01 | Decision records include alternatives, failure/security/cost tradeoffs and validation; provider budget authorised separately |
| S0-03 Data | PostgreSQL tenant/branch/customer/leg/attempt/cargo schema and migration strategy; data | S0-01/02 | Composite tenant constraints, RLS design, indexes, compatibility mapping, rollback/restore strategy reviewed |
| S0-04 Security | Permission matrix and threat model; security/compliance | S0-01/03 | Deny-by-default roles/resources, support elevation, device lifecycle, tracking/retention purpose and abuse tests |
| S0-05 Technical | Versioned job/assignment/sync/evidence API and event contracts; backend/mobile | S0-03/04 | Offline sequence/replay/reassignment examples, safe conflict responses, schema limits and old-client compatibility |
| S0-06 UX | Driver/dispatch/customer screen map and safe journeys; UX/SME | S0-01/05 | Keyboard/touch flows; pending/accepted/conflict states; physical driver trial plan; no fake auth/integration controls |
| S0-07 QA | Acceptance and peak/failure workload specification; QA | S0-01/05 | Baseline data mix, integrity assertions, tenant escape tests, eight-hour/reboot/upload scenarios |

Screen map: sign-in/device verification → shift/vehicle checks → assigned jobs → leg detail → arrival/scan → evidence → locally recorded/accepted/conflict → exceptions → shift end. Dispatch: branch overview → booking/import → cargo/document review → assignment/run → live workload → exception/custody review → evidence/audit. Customer: account booking → permitted tracking → POD. Admin: membership/grants → branches/depots → policies → device revocation → audited support. Finance/fleet/reporting extend later without bypassing scopes.

## Sprint 1 — Production-like foundation, not bulk features

| ID / type | Deliverable and owner | Dependency | Acceptance evidence |
| --- | --- | --- | --- |
| S1-01 Infrastructure | Isolated development environment, private network/stores and managed secret identities; platform | S0-02/04 | IaC review, no public DB, least privilege, budget limits; no user secrets in repository |
| S1-02 Data | Executable migrations and PostgreSQL runtime adapter; backend/data | S0-03, S1-01 | Fresh/upgrade migration, tenant FK/RLS/pool-reuse tests, bounded connection pools and transaction rollback |
| S1-03 Security | Identity/MFA, scoped permission resolver, registered-device sessions; security/backend | S0-04/05, S1-02 | Cross-tenant/branch/customer denial, rotation replay, expiry/revocation, privileged step-up |
| S1-04 Technical | Immutable events/audit/receipts and transactional outbox relay; backend | S0-05, S1-02/03 | Crash before/after commit and lost-response replay; duplicate consumer handling; no missing accepted receipt |
| S1-05 Mobile | Real driver shell, encrypted local store and durable outbox; mobile | S0-02/05/06, S1-03 | Queue survives app kill/reboot, secure key lifecycle; visible pending state; no false accepted completion |
| S1-06 Infrastructure | Private object upload/quarantine and metadata lifecycle; platform/backend | S0-04/05, S1-03 | Scope/hash/size/type checks, interrupted upload recovery, quarantine denial and key-aware restore |
| S1-07 Technical | Observability, CI artifact gates and rollback skeleton; platform/QA | S1-01–04 | Redacted correlated logs, queue-age alerts, synthetic flow, immutable artifacts and tested rollback |
| S1-08 Frontend | Scoped web shell and customer permission fixture; frontend | S0-06, S1-03 | Accessible real API views; stale/session-expired states; customer cannot retrieve another account's POD |

## Sprint 2 — First reliable operational vertical slice

| ID / type | User story / owner | Dependency | Acceptance evidence |
| --- | --- | --- | --- |
| S2-01 Feature | Dispatcher books cargo with packages and verified AWB; backend/web | S1-02/03/04/08 | Valid typed data, atomic job/cargo link, reject invalid tenant/customer and conflicting references |
| S2-02 Feature | Dispatcher assigns eligible driver; driver acknowledges; backend/mobile | S2-01, S1-05 | Durable assignment history/generation; cancellation/reassignment propagates and stale command conflicts |
| S2-03 Feature | Driver arrives/scans/picks up offline; mobile/backend | S2-02, S1-04/05 | Ordered scans/actions across reboot; ACK receipts; duplicates harmless; revoked/stale assignment never auto-applied |
| S2-04 Feature | Driver captures required delivery evidence; mobile/backend | S2-03, S1-06 | Resumable validated media, recipient/policy gates, pending until accepted; missing evidence blocks completion |
| S2-05 Feature | Customer retrieves permitted POD; customer/backend | S2-04, S1-08 | Account scope and current permission rechecked, private short-lived download and access audit |
| S2-06 Feature | Operations resolve failure/reattempt/return and preserved conflict evidence; backend/SME | S2-03/04 | Explicit attempts/custody, new scans required, original evidence/history preserved, no last-write-wins |
| S2-07 Technical | Durable realtime and separate GPS lane; backend/platform/mobile | S1-04/05/07 | Reconnect cursor/snapshot, authorised replay, gateway/cache degradation; shift tracking purpose and freshness |
| S2-08 QA | Peak/recovery/security/UAT gate; QA/operations | S2-01–07 | Part I peak mix, integrity checks, eight-hour recovery, physical devices, restore timings, independent review |

## Critical path and parallel work

S0-01 → S0-03/04/05 → S1-02/03/04/05/06 → S2-01/02/03/04/05/06 → S2-08. Provider/IaC procurement is a separate potential blocker. UX, acceptance scenarios and cost modelling can proceed alongside data/security design. Web/mobile build against agreed contracts; workers and telemetry cannot invent independent custody rules. Heavy imports/reporting remain isolated worker/read-model tasks after core contracts.

## Definition of Ready

Story has measurable operational outcome, scope/owner, versioned contract, permission/resource rules, data migration, offline/failure expectations, evidence/retention requirements, dependencies, UX and test acceptance. Decisions on which it depends are recorded. Unknowns that can invalidate custody/security are not deferred to implementation guesses.

## Definition of Done and release gate

Implementation and migrations reviewed; real-store tests pass; tenant/permission negatives and offline/replay/failure cases pass; telemetry/runbooks and compatibility included; no embedded secrets; relevant accessibility/physical-device checks complete. Acceptance evidence is attached to the story. Pilot additionally requires trained operators, support ownership, restore/rollback drill, security/compliance review and PO/operations acceptance. A UI alone, local test suite or green deployment is insufficient.

## Technical-debt and change control

Track each gap with ID, affected invariant, consequence, owner, mitigation, exit criterion and review date. Current priorities: SQLite production gap, fixed-role scope, no native offline/device layer, in-database binary storage, undrained outbox and no GPS subsystem. Any scope addition must state impact on critical path/cost/test coverage and identify work displaced. Never mark these gaps done through document creation alone.
