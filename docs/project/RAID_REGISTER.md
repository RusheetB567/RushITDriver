# RAID register, assumptions and constraints

Baseline: 7 October 2026. Owners are accountable role proposals; individuals and calendar commitments are pending. H/M/L mean qualitative high/medium/low. For assumptions/issues/dependencies probability is not applicable. Gate targets avoid invented dates; PM replaces them with dates after staffing and scope are agreed.

| ID | Category | Description | Probability | Impact | Owner | Mitigation / next action | Target | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| R01 | Risk | Offline actions/media are lost or duplicated | H | H | Mobile/domain lead | Atomic local outbox, stable IDs, termination/partial-upload tests | G3 | Open |
| R02 | Risk | Organisation/driver/customer data leaks across scope | M | H | Security lead | Permission catalogue, scoped repos, PostgreSQL RLS/file/realtime negative tests | G1/G3 | Open |
| R03 | Risk | Scope growth delays a usable release | H | H | PO/PM | Explicit MVP boundary and impact-reviewed changes | Each iteration | Open |
| R04 | Risk | Tracking drains battery or OS suppresses updates | H | H | Mobile lead | Native device matrix, shift/adaptive policy, battery/foreground/background trials | G3 | Open |
| R05 | Risk | Map/provider costs exceed operating budget | M | H | Sponsor/architecture lead | Estimate geocoding/routing/location traffic and quotas before choosing | G1 | Open |
| R06 | Risk | Drivers reject distracting/slow workflows | M | H | PO/operations | Driver interviews and parked-task usability tests, larger controls | G2/G3 | Open |
| R07 | Risk | Integration/reconciliation complexity exceeds assumptions | M | H | Finance/integration lead | Keep pricing/accounting release boundary explicit; sandbox contracts | Before P7 | Open |
| R08 | Risk | File tampering/unsafe upload exposes recipient evidence | M | H | Security/evidence lead | Private adapter, integrity/finalisation, validated content and malware pipeline | G3 | Open |
| R09 | Risk | National scale is assumed from a local prototype | H | H | Architecture lead | Production adapter, capacity/load/recovery evidence before commitments | G4 | Open |
| R10 | Risk | Operational exceptions break custody or billing correctness | H | H | Domain/operations | Define return/partial/transfer/failed workflows and compensating events | Before relevant slice | Open |
| R11 | Risk | Unsupported background-location behaviour delays store release | M | H | Mobile/app-store owner | Early native feasibility and policy review through official providers | G3 | Open |
| R12 | Risk | Same-origin browser errors or sensitive drafts are silently lost | M | M | Web/QA lead | Form preservation, auth/offline/network failure tests and actionable recovery | G2 | Open |
| A01 | Assumption | First pilot is one organisation/branch/depot and 5–30 drivers | — | H | PO | Confirm with actual operator; update workload model | G0 | Unverified |
| A02 | Assumption | Single pickup/delivery is adequate for first pilot | — | H | Operations | Check multi-drop, return, depot and linehaul requirements | G0 | Unverified |
| A03 | Assumption | Existing manual finance process can support MVP pilot | — | H | Finance/PO | Determine mandatory rates/quotes/invoicing dependency; revise scope if needed | G0 | Unverified |
| A04 | Assumption | RushIT is provisional independent branding | — | M | PO | Confirm product identity before store/market materials | Before UX release | Unverified |
| A05 | Assumption | No proprietary RTMS integration is needed for initial standalone pilot | — | H | PO/integration lead | Obtain authorised contract if integration becomes required | G0 | Unverified |
| I01 | Issue | Successful delivery/POD/private evidence are not implemented | — | H | Evidence/domain lead | Build package/evidence/policy acceptance slice, with negative tests | G2 | Open |
| I02 | Issue | Native mobile and secure offline queue do not exist | — | H | Mobile lead | Native shell, encrypted cache, media/outbox recovery and physical-device tests | G3 | Open |
| I03 | Issue | Runtime is SQLite/JS with no versioned upgrade migrations | — | H | Backend/database lead | Strict contracts, migration harness and PostgreSQL adapter validation | G1/G2 | Open |
| I04 | Issue | Roles are hard-coded; permission/branch/account grants are absent | — | H | Security/backend lead | Permission catalogue and deny-by-default scope model | G1/G2 | Open |
| I05 | Issue | Outbox exists but publication replay worker is absent | — | H | Realtime lead | Durable publication/reconnect cursor and restart tests | G2 | Open |
| I06 | Issue | UAT participants/security/support owners are not named | — | H | Sponsor/PO | Nominate people, scenarios, availability and escalation coverage | G0/G3 | Open |
| I07 | Issue | Failed attempts have free-text reasons and no structured attempt entity | — | H | Domain/operations | Reason catalogue, explicit custody/outcome and attempts/returns | Before exception slice | Open |
| I08 | Issue | Audit is minimal; job status has no DB allowed-state constraint | — | M | Backend/database lead | Audited revision/assignment change metadata; constraints/migrations | G2 | Open |
| D01 | Dependency | Pilot workflows/required evidence and ATL policy | — | H | Operations/PO | Supply operational rules and representative exception cases | G0/G1 | Pending |
| D02 | Dependency | Hosting/identity/storage/maps provider budget and credentials | — | H | Sponsor/DevOps | Decide region/cost/retention; provision scoped test resources | Before provider work | Pending |
| D03 | Dependency | iOS/Android devices and organisation store accounts | — | H | Mobile/app-store owner | Agree support matrix, signing/distribution and devices | Before device pilot | Pending |
| D04 | Dependency | Privacy/retention/tracking requirements and review | — | H | Privacy/operations | Confirm purpose, break/off-shift behaviour, retention and evidence access | G3 | Pending |
| D05 | Dependency | Budget, team capacity and committed start date | — | H | Sponsor/PM | Set staffing/estimate baseline before calendar promises | G0 | Pending |
| D06 | Dependency | Production RPO/RTO and incident/support coverage | — | H | Support/sponsor | Agree objectives; schedule restore/escalation drill | G3 | Pending |

## Fixed current constraints

User controls staging/commits/pushes and external publication. Desktop runtime/Git metadata must be preserved. Only supplied operational evidence and authorised APIs may be used. No cloud/provider secrets are available or implied. Current local service binds loopback and is unsuitable for real data/internet exposure. Prototype storage must not be migrated to production as authoritative evidence.

## Update rule

At each milestone, record closed item evidence, new risks, changed impact/owner/target and links to affected requirement/backlog IDs. Do not remove a risk merely because its design is documented; close it when implementation and validation justify closure.
