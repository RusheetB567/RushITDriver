# Rush IT — Enterprise readiness and blueprint coverage

10 October 2026 · Repository assessment, not certification

## Actual baseline

The active application is apps/api/server.cjs with apps/web, Node and SQLite. server.cjs/public is the earlier disposable prototype. The version remains 0.3.0: this delivery adds architecture and planning artifacts, not new production capabilities.

| Area | Evidence in current repository | Enterprise gap / required gate |
| --- | --- | --- |
| Authentication | auth.cjs: salted scrypt, hashed cookie sessions, logout; server origin/CSRF/header checks | MFA/OIDC, registered devices, short tokens/rotation, recovery and suspicious-login controls |
| Tenant authorisation | Organisation queries and driver assignment checks in jobs/logistics; three fixed roles | Branch/depot/customer scoped permissions, database RLS/composite relationships, privileged support access |
| Transactional jobs | jobs.cjs: optimistic version checks, idempotency transaction, event/audit/outbox writes | Explicit assignment generations/attempts; richer custody/return/failed-pickup transitions |
| Cargo | Freight/package rows, calculated totals, AWB fields, linking, scans | Typed relational identifiers/parties, many consignments/legs, depot manifests and regulated handling |
| Documents | Local PDF/OCR, encrypted originals, human field review | Binaries currently in relational storage; production private object upload, quarantine/malware validation, async durable workers and managed keys |
| POD | Signature/photo/recipient/GPS/scan gates and encrypted payload | Resumable object upload, customer retrieval scope, independent retention/holds, evidentiary lifecycle |
| Offline | Online API idempotency protects supported retried requests | No encrypted native local DB, reboot-safe queue, dependencies, device receipts or conflict review |
| Realtime | SSE invalidations and session checks; stored outbox exists | No durable relay/replay/consumer ack; local gateway limit cannot meet 5,000 connection target |
| GPS | Optional point attached to action/POD | No tracking ingestion, queue, latest cache, historical store or work-policy controls |
| Dispatch | Job queues/search/sorts, assignment, driver availability, batch actions | Branch scopes, live operational map, capacity/runs and safe large reassignment |
| Identity hierarchy | Admin/dispatcher/driver local accounts | Customer/depot/finance/auditor roles and account management not implemented |
| Fleet | Driver shift controls | Vehicles/qualification/defect/capacity and device selection not complete |
| Messaging | Scoped in-app messages/read receipts | External delivery adapters, notification retries and integration contracts |
| Database/operations | Local SQLite WAL, bounded reads, API error IDs | PostgreSQL runtime/migrations, pool isolation, distributed quotas, production observability and HA |
| Quality | Existing automated local workflow/integration tests | Native-device, PostgreSQL/RLS, combined peak, soak, recovery and independent security/UAT evidence |
| Deployment | Local loopback service and package lock | IaC, isolated cloud environments, CI/CD promotion, backups/restore/rollback and on-call runbooks |

Do not infer completion from an interface, a schema proposal, an encrypted blob or a test using only the local database. Existing compliance documents are design guidance, not legal sign-off. Previous release reports remain historical evidence; new targets require new verification.

## Coverage of the master prompt's 95 blueprint deliverables

The A–Y blueprint is the opening architecture workshop baseline. Coverage here means a documented design starting point, not approved implementation. Items requiring additional detailed artifacts remain explicitly open.

| Required items | Baseline location | Detail still required before dependent production implementation |
| --- | --- | --- |
| 1–10 Vision, scope/exclusions, stakeholders/personas/journeys, FR/NFR, MVP/roadmap | Blueprint A–H, V; existing SCOPE_AND_PRD, REQUIREMENTS_CATALOGUE and PRODUCT_ARCHITECTURE | Named operational acceptance owners, field-observed personas, customer account journeys and agreed exclusions |
| 11–18 Current/future driver/dispatch/customer/depot/exception/freight workflows | Blueprint A, D, N, Y; existing CAPABILITIES_AND_PROCESSES | Actual depot custody, failed pickup, return and dangerous-goods SOPs; current UI is not field observation |
| 19–27 Context/container/component/deployment/network/mobile/backend/frontend/integration architecture | Blueprint J–L, O, P, S | Provider-specific diagrams and network policies; screen/component ownership; integration partner contracts |
| 28–33 Domain, ERD, ownership, tenant, retention/archive | Blueprint L–M; compliance baseline/addendum | Executable production migrations, typed columns/constraints, approved schedules and legal holds |
| 34–39 Job/assignment/POD/failure/return/incident lifecycles | Blueprint N–O, R | Enumerated command/guard/error specifications with attempt and custody semantics |
| 40–45 API standards/catalogue/errors/pagination/idempotency/webhooks | Backlog contracts below; Blueprint O, P | Versioned OpenAPI, complete per-role examples, signed webhook retry/replay tests |
| 46–49 Event/websocket/notification/messaging architecture | Blueprint P and L | Typed event catalogue, delivery cursors, consumer ownership and notification adapters |
| 50–55 Offline/local DB/sync/conflicts/GPS/background execution | Blueprint O–Q | Mobile encrypted schema and key lifecycle, OS scheduler constraints, measured device trials |
| 56–64 Authentication/authorisation/RBAC/tenant/threats/controls/audit/device/secrets | Blueprint R–S; compliance baseline | Identity/provider configuration, permission seed catalogue, trust-boundary threat register with verification evidence |
| 65–70 Cloud/environments/IaC/CI/CD/backup/DR | Blueprint S, T, U | Selected topology, deployable IaC, least-privilege identities and timed restore drill |
| 71–76 Capacity/load/storage/peaks/scaling/SLOs | Blueprint H–I | Real pilot counts, cost quotes, route mix and production-like performance report |
| 77–81 Monitoring/alerts/incidents/support/runbooks | Blueprint T | Actual dashboards, alert routing, named on-call rota and exercised runbooks |
| 82–86 Test/automation/performance/security/UAT | Blueprint U; backlog acceptance gates | Independent executed reports and real device/SME sign-off |
| 87–95 WBS/team/RACI/dependencies/risks/debt/release/DoR/DoD | Blueprint E–G, V–Y; ENTERPRISE_BACKLOG | Staffing/budget, estimates, accountable appointees and evidence-based release approval |

## Initial API and event contracts to finalise

Production contracts are proposed, not advertised as available routes. Preserve /api/v1 compatibility while designing a versioned migration; current API cookie trust assumptions are unsuitable for a native bearer client without an explicit identity adapter.

| Domain | Proposed command/query | Mandatory constraints |
| --- | --- | --- |
| Identity/device | Session exchange/refresh/revoke; register/revoke device | Verified identity, rotated token family, device owner, audited privileged revocation |
| Tenant | Branch/depot grants; account membership | Server-resolved tenant, grant scope, no client elevation |
| Booking/cargo | Create job; consignment/packages; typed AWB; async import/status | Idempotency, customer scope, bounded schema; per-row import errors |
| Dispatch | Assign/acknowledge/reassign | Expected job/assignment version, eligible driver/vehicle, history |
| Execution | Advance leg/attempt; scan; fail; reattempt; return; incident | Current assignment/attempt, supported transition, custody and evidence gates |
| Synchronisation | Bounded command batch; operation receipt; scoped snapshot/cursor | Stable operation ID/hash, ordering dependencies, ACK/conflict, no payload-changing replay |
| Evidence | Authorise upload; finalise/hash; review; submit POD; permitted retrieval | Quarantined object, verified metadata, policy, signed short-lived object access |
| Location | Bounded telemetry batch; current positions | Active authorised work/device, sequence/age/accuracy, queue lane |
| Events/webhooks | Scoped replay; webhook registration/delivery status | Current visibility, stable cursor, signed timestamped delivery, destination validation, retries/DLQ |

All mutation contracts use explicit schemas, documented maximum sizes, correlation IDs and allowlisted error codes. Standard error: code, safe message, requestId, retryable, optional authorised conflict details. Cursor query returns items, nextCursor and snapshot/cursor metadata; enforce scope before pagination. 400 schema, 401 identity, 403 permission, 404 scoped absent, 409 version/transition/idempotency conflict, 413 size, 429 with Retry-After, 503 transient dependency. No SQL or private evidence in errors.

Initial events: JobCreated, BookingValidated, AssignmentCreated, AssignmentAcknowledged, AssignmentRevoked, LegArrived, PackageScanned, PickupAccepted, DeliveryFailed, AttemptCreated, ReturnRequested, CustodyTransferred, EvidenceUploaded, EvidenceValidated, PODAccepted, JobDelivered, IncidentReported, DeviceRevoked. Each needs schema, producing transaction, permitted consumers, version policy, retention and replay/deduplication contract. Event metadata must not become an unrestricted private-data feed.

## Blueprint maturity gate

This delivery is draft v1, ready for architecture/operational review. It does not reach the brief's production gate merely because the sections exist. Before major dependent feature work: validate A01–A10, approve critical ADRs, define full schema/API/permission/attempt/evidence contracts, agree MVP scope and establish acceptance owners. Safe preparatory work includes field discovery, contract design, isolated spikes and strengthening existing tests. No cloud spend or production rollout is implied.
