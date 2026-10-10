# Scope statement, PRD and MVP boundary

Status: DRAFT · product owner acceptance pending. This supersedes the older blueprint's release boundaries where they differ. Product architecture remains the technical baseline until an ADR replaces it.

## Product problem and personas

- Driver: needs clear next actions, accurate freight data, quick evidence and durable work without reception; success is finishing a run without lost records or repeated typing.
- Dispatcher: needs current assignment/availability, actionable exceptions and complete timelines; success is resolving delays without searching multiple systems.
- Organisation administrator: needs controlled users, services/policies and visible audit; success is safe configuration without database access.
- Customer/service user: needs reliable milestones and permitted POD; success is understanding outcome without exposing private driver information.
- Finance user: needs approved charges tied to completed work; success is reconcilable billing in a later commercial slice.
- Platform/support operator: needs tenant provisioning, incident visibility and safe recovery; success is supporting customers without unrestricted production database access.

Personas are hypotheses from the brief, not findings from interviews.

## Proposed first commercial MVP

| Capability | Included boundary | Release gate |
| --- | --- | --- |
| Identity/organisation | Organisation admin, dispatcher, driver; company isolation; secure sessions and revocation | Permission/security tests |
| Structure | Pilot branch/depot, drivers and vehicle association | Operational discovery confirms scope |
| Booking | Dispatch-created jobs, customers/contacts, service/windows/handling requirements | Booking validation and UAT |
| Physical freight | Consignment/package distinction, barcode/QR and manual fallback, discrepancy handling | Wrong/unknown/duplicate/missing tests |
| Execution | Assigned pickup/delivery, acceptance/arrival, policy requirements, failure and reattempt | Server state and item tests |
| POD | Required recipient/photo/signature/GPS/time according to versioned rules; private file access | Missing-evidence and tamper tests |
| Native driver | iOS/Android, shifts, clear work list/detail, capture and privacy controls | Supported-device matrix |
| Dispatch/live/map | Driver/job boards, live scoped updates, current/stale location presentation | Assignment/reconnect/privacy tests |
| Offline | Cached assigned work, local transactional queue, media recovery, conflicts and explicit sync states | Network-loss/termination tests |
| Communication | Basic driver/dispatch text and critical acknowledgements | Scope/delivery/ack tests |
| Customer visibility | Expiring revocable public tracking; permitted POD outcome | Token expiry/revocation/privacy tests |
| Reporting/support | Basic completed/failed work reports and audit/support views | Scope/export/restore tests |
| Operations | Staging, observability, backup/restore, rollback, support and training | Pilot/release checklist |

Customer self-service bookings/quotes/address book, full pricing/billing/accounting, linehaul/multi-leg, custom forms, advanced reporting and dispatch recommendations target Phase 2 or enterprise. The overall lifecycle includes finance; its MVP treatment is an open pilot decision, not a claim that finance can be ignored.

## Exclusions

Advanced AI, full route optimisation, RFID, contractor payroll, warehouse management, predictive maintenance, marketplaces and bespoke BI are excluded from the initial scope unless formally reprioritised. No proprietary system access or integration is assumed. The browser prototype and local SQLite foundation are not commercial delivery substitutes.

## Release-level acceptance

Demonstrate booking → allocation → real driver capture → offline/reconnect as needed → server-accepted POD → permitted customer milestone/report; or an explicit preserved exception. Verify other drivers/organisations cannot read or mutate jobs/evidence. Repeat critical flows after process/device restart. A delivery is not complete just because a local UI has changed colour.

## Data and lifecycle rules

Keep job, leg, consignment, package, assignment, attempt, evidence and POD separate. Confirmed server state and local pending state are separate. Multi-leg progression will be designed before implementation and must not be simulated with one job-wide status. Client commands express intent; backend resolves authorised transitions and evidence policies. GPS absence is recorded rather than fabricated; geofencing cannot complete work alone.

## Proposed non-functional targets

Connected assignment p95 visibility within 10 seconds; routine API p95 under 1 second at agreed pilot load; four-hour offline assigned run; zero silent losses/duplicate effects in prescribed recovery tests; no unresolved critical tenant/evidence defects. Proposed production availability 99.9% needs cost/deployment review. Agree recovery RPO/RTO, crash-free-session and battery budgets before pilot; do not invent measured percentages or contracts.

## Discovery questions that affect release scope

Pilot company/branch/driver count and operating region; actual devices/scanners; mandatory pickup/POD and ATL rules; freight exceptions/returns; tracking retention/break policy; first-release pricing/accounting dependency; customer visibility permissions; hosting/providers/budget; UAT/support owners. Independent useful work proceeds while decisions are gathered; dependent production work waits for the applicable decision.
