# Codebase review against the project brief

Review date: 7 October 2026. Scope: executable API/schema/domain/web and existing integration tests. This is a development review, not penetration-test certification or production acceptance.

## Assessment

The local foundation is reusable: normalised job/leg/consignment/assignment data, scoped identity, salted passwords, hashed sessions, validated intent commands, revision/idempotency controls and transactional audit/events. It is not a complete courier operating system or commercial MVP.

| Area | Current evidence | Gap / impact | Priority |
| --- | --- | --- | --- |
| Identity | `apps/api/auth.cjs`; login/logout integration tests | No recovery/MFA/OIDC/device lifecycle; local HTTP only | MUST before production |
| Permissions | Role checks and organisation/active-assignment scope | Hard-coded role lists; branch/customer/permission grants absent | MUST foundation hardening |
| Database | SQLite schema with FKs and append-only event/audit triggers | No versioned upgrade runner or executed PostgreSQL adapter; status column unconstrained | MUST before migration/expansion |
| Job engine | Single pickup/delivery state machine and revision checks | No per-leg statuses/physical package custody; pickup can proceed without policy scans/evidence | MUST operational execution |
| Delivery/POD | Successful delivery intentionally rejected | No evidence uploads/POD validation/acceptance | MUST next execution slice |
| Failure | Free-text failed event and dispatch reattempt | No structured reason/attempt/return/partial outcomes | MUST exception slice |
| Realtime | SSE invalidation after commit; durable outbox rows exist | No outbox replay/ack worker or cursor; reconnect hints are not delivery guarantees | MUST recovery slice |
| Offline | Server idempotency and optimistic conflict detection | Browser does not persist commands, cache assigned work or recover media | MUST native/sync slice |
| GPS | Optional event sample validation | No shift tracking, battery tests, continuous intake or stale fleet map | MUST pilot tracking |
| Web | Authenticated booking/assignment/jobs/shift/users/audit | Limited form/reconnect/error browser tests; no maps/customer/messages/report service | Incremental MVP |
| Quality | 20 tests pass, including tenant attacks/replay/restart | No strict TS/lint, native tests, load/restore/device/UAT evidence | MUST readiness |
| Audit | Immutable inserts, actor/time/state summary | No complete read/export/security-access/request/device evidence | MUST security/governance |
| Scale | Single-process sync SQLite and in-memory limit/SSE | No multi-instance storage/rate/presence guarantee; catalogues and event detail may grow unbounded | Production design/load gate |

## Current implemented states

UNASSIGNED → ASSIGNED → ACCEPTED → EN_ROUTE_PICKUP → ARRIVED_PICKUP → PICKED_UP → EN_ROUTE_DELIVERY → ARRIVED_DELIVERY. Failure at delivery leads to FAILED; dispatch can authorise ASSIGNED reattempt. Holds apply to unassigned work. Cancellation is limited to supported pre-pickup states. DELIVERED is not enabled until evidence acceptance exists.

Assignment revocation is checked before returning cached mutation responses. Same command/key/payload replays one outcome; changed payload/key reuse fails. This is a server primitive, not an offline mobile engine.

## Sequencing recommendation

1. Introduce versioned migrations and permission/typed-contract boundaries before extending the schema.
2. Build package/barcode and policy-driven pickup/evidence/POD as a tested end-to-end slice.
3. Build native/auth/local persistence foundations and durable commands/media/conflict recovery.
4. Add outbox replay, live presence/location/map and real messaging services.
5. Add scoped customer tracking/reports and complete production/pilot gates.

Do not replace working domain checks with cosmetic account switching or clone the benchmark screens. Keep existing prototype separate and never treat its localStorage POD as accepted evidence.

## Verification scope

`npm run check` validates syntax; `npm test` runs bounded domain/API/security/database tests. Tests use isolated synthetic credentials/data. A passing suite does not establish all project requirements or legal compliance. PostgreSQL DDL remains a proposal. Local browser review checks appearance/flow; pilot acceptance must involve actual drivers/dispatchers.
