# Stakeholders, RACI and delivery governance

7 October 2026 · proposed responsibilities; names other than the requesting user are not yet appointed.

## Stakeholder matrix

| Stakeholder | Interest / influence | Needed involvement | Current representation |
| --- | --- | --- | --- |
| Sponsor | Funding, scope and release risk / high | Charter, cost and milestone decisions | User proposed; designation pending |
| Product owner | Operational outcomes and priorities / high | Backlog order and feature/release acceptance | User proposed; designation pending |
| Project manager | Dependencies, RAID and delivery health / high | Weekly review and sprint coordination | Function performed by assistant; accountable human pending |
| Dispatch representative | Allocation, exceptions and live visibility / high | Discovery and UAT each operations slice | Not appointed |
| Driver representatives | Safety, offline work, scans and evidence / high | Device trials and workflow UAT | Not appointed |
| Branch/depot manager | Handoffs, shifts and service windows / medium | Pilot definition and process review | Not appointed |
| Customer/service representative | Booking, tracking and disputes / medium | Visibility/POD policy and UAT | Not appointed |
| Fleet representative | Vehicles, capacity and defects / medium | Phase-2 requirements and pilot vehicle fit | Not appointed |
| Finance representative | Rates, charges and accounting / medium | Define first-release billing boundary | Not appointed |
| Engineering lead | Maintainability and architecture / high | Design and code review | Assistant prepares; independent reviewer pending |
| Security/privacy reviewer | Tenant isolation, location and evidence / high | Threat review and release assessment | Not appointed |
| QA lead | Test evidence and defect triage / high | Acceptance matrix and gate review | Assistant prepares automated evidence; human UAT owner pending |
| Support/operations owner | Alerts, incidents and restore / high | Runbooks, drills and pilot coverage | Not appointed |
| External providers | Maps, identity, cloud, notifications / medium | Contracts, quotas, credentials and test environments | Not selected |
| App-store account owner | Signing/distribution / high at release | Organisation accounts and release submission | Not appointed |

No outbound stakeholder messages are authorised or sent by creating this register.

## RACI

R = responsible for work; A = accountable decision owner; C = consulted; I = informed. One A per activity. Roles are proposed, not assigned people.

| Activity | Sponsor | PO | PM | Engineering | Operations | QA/security | Support |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Charter, funding, delivery commitment | A | C | R | C | C | C | I |
| Requirements/MVP prioritisation | C | A | R | C | C | C | I |
| Discovery/process mapping | I | A | R | C | R | C | C |
| Architecture/domain/ADR | I | C | C | A/R | C | C | C |
| Sprint execution/dependencies/RAID | I | C | A/R | R | C | C | I |
| Code, migrations and documentation | I | C | I | A/R | C | C | C |
| Test strategy and quality gate | I | C | C | R | C | A/R | C |
| Operational UAT evidence | I | A | C | C | R | R | C |
| Privacy/security assessment | C | C | I | R | C | A/R | C |
| Production release authorisation | A | R | C | C | C | C | C |
| Production incident/restore drill | I | C | C | R | C | C | A/R |
| Scope changes within agreed budget | C | A | R | C | C | C | I |
| Budget/date changes | A | C | R | C | C | C | I |

Assistant-generated tests/design reviews do not replace independent assurance or real-user acceptance.

## Cadence and gates

Every two-week iteration: refine requirement IDs/acceptance tests → plan capacity/dependencies → develop reviewable slice → run tests and update risks → demonstrate → PO feedback → retrospective. Weekly health review records scope changes, unresolved RAID items, completed evidence and next gate. No scheduled automation is created by this plan.

| Gate | Evidence needed | Exit decision |
| --- | --- | --- |
| G0 baseline | Charter, scope, pilot assumptions, owners, RAID and backlog | PO/sponsor review; no invented approval |
| G1 architecture | Domain/ERD/state contracts, migration plan, permissions, evidence/offline threat review | Engineering and QA/security |
| G2 operational slice | Backend/UI, versioned migrations, tests, error recovery, audit and docs | Engineering/QA; PO demo acceptance |
| G3 pilot readiness | Native/offline/device evidence, tenant/file tests, support/restore plan, privacy policy, release runbook | PO/operations/security/support |
| G4 commercial release | Pilot metrics, defect closure, monitoring, training, rollout/rollback, app-store readiness | Sponsor/PO with gate-owner recommendations |

## Definition of ready

Requirement has ID, value, priority, accountable owner, acceptance criteria, dependencies, security/data effects, test approach and release target. External decisions are resolved before dependent implementation. Local adapter work is labelled local; missing cloud credentials must not be hidden behind simulated success.

## Definition of done

Implemented UI and service; backend permissions/input/state validation; transactional audit as needed; migrations/contracts documented; relevant tests and error/loading/offline behaviour verified; monitoring added where required; docs updated; review and PO acceptance recorded. Before PO acceptance, use `PARTIAL` for the project feature even if a local implementation passes tests. `DONE` may describe a clearly bounded engineering task, never an unaccepted production feature.

Allowed status values: DONE, PARTIAL, BLOCKED, NOT STARTED. Use BLOCKED only for a named unresolved dependency. A planned risk is not automatically blocked.

## Change and decision records

Maintain `DECISIONS.md` with ID, context, options, decision, tradeoff, owner/status and revisit condition. For changes, add CR ID, affected requirement/backlog IDs, effort/risk/data impact, chosen release, decision owner and validation changes. Existing review artifacts remain traceable after a decision changes.

## Implementation phase reporting

Each implementation slice reports A objective; B operational value; C architecture; D files; E migration; F APIs/events; G security; H code; I test cases/results; J review steps; K suggested Git branch/commit/PR text; L honest status. Suggested Git text is not an instruction to execute Git writes. A documentation-only phase marks DB/API/code changes not applicable rather than inventing them.
