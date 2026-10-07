# Modern Courier Platform — Product and Technical Specification

Status: Proposed baseline for review and implementation
Date: 7 October 2026
Basis: User-supplied cisdriver3 application outline

## 1. Purpose and scope

Build a modern courier platform that connects customer bookings, dispatch operations and driver execution through delivery evidence and operational reporting. Preserve the operational capabilities described in the supplied outline while designing a new implementation rather than assuming access to SICAB internals.

The supplied outline is requirements input, not a verified description of private production APIs. Authentication, status names, integration protocols and company-specific rules remain unknown. This document proposes a platform design; it does not claim compatibility with an existing SICAB installation.

Primary surfaces:

- Driver mobile app: assigned work, pickup, scans, delivery, evidence, messaging and offline operation.
- Dispatcher web portal: booking, allocation, driver availability, fleet visibility and exceptions.
- Customer portal: booking, tracking and permitted delivery evidence.
- Administration: accounts, roles, services, operational policies and integrations.

An initial implementation should establish reliable booking-to-POD execution. Full accounting, complex tariffs, optimisation and advanced analytics follow after operational validation.

## 2. Actors and access

| Actor | Permitted work | Access boundary |
| --- | --- | --- |
| Driver | Work assigned jobs, capture evidence, report exceptions, message dispatch | Own assignments and permitted history |
| Dispatcher | Create and allocate jobs, manage runs, monitor fleet, resolve exceptions | Assigned company and operational bases |
| Operations manager | Supervise work, approve overrides, view reports | Company or explicitly assigned bases |
| Customer user | Book and track jobs, obtain permitted POD | Own customer account |
| Administrator | Configure identities, services, policies and integrations | Explicit administrative scope |
| Accounts user | Review rates, charges and accounting exports | Authorised financial records |
| Integration identity | Perform approved API operations | Explicit company and API scopes |

Enforce permissions on the server for every resource. UI visibility is not an access control. Company identity must come from authenticated context and be checked against every referenced entity.

## 3. Operational model

A job is the commercial booking. A consignment describes the shipment. Items are individually identifiable pieces. Stops describe pickup or delivery activity. Legs connect stops, and runs sequence work assigned to a driver and vehicle.

Keep these concepts separate so that one booking can support multiple packages, partial deliveries, transfers and failed delivery attempts without inventing additional job numbers.

Every operational change records actor, server receipt time, device occurrence time, assignment version, reason where applicable and a unique client event identifier.

## 4. Driver workflow

### Identity and shifts

1. Driver signs in to an authorised company/base using the selected identity provider.
2. Driver confirms vehicle and starts a shift.
3. App requests location and camera permissions when their features are used, explaining operational purpose.
4. Driver sees availability, connectivity and outstanding sync status.
5. Ending a shift stops operational tracking according to company policy and displays pending work or uploads.

Production authentication must use an approved identity provider and server-side access controls. A demo login is not a production authentication implementation.

### Assigned work

Show new assignments, active stops and completed work. Each job displays service, ready/window times, pickup/delivery addresses, contacts, instructions, item count, weight, reference and required evidence. Refreshes must preserve locally recorded events and unfinished forms.

Acceptance is an explicit event. Declining requires a reason where policy permits it. Dispatcher reassignment invalidates the old assignment for future authoritative updates but preserves submitted events for review.

### Pickup

1. Open the pickup stop and launch navigation using the chosen mapping provider.
2. Mark arrival; optionally record permitted location evidence.
3. Scan or manually enter expected item identifiers.
4. Review discrepancies, actual quantities and weight.
5. Capture required photos or damage reports.
6. Confirm pickup and queue its operational event.

Unknown, duplicate and already-collected barcodes must have distinct outcomes. Manual overrides require permission and a reason. A QR code is untrusted input: validate its format, size, contents and shipment association before use.

### Delivery and POD

1. Mark delivery arrival.
2. Confirm the items presented and record discrepancies.
3. Capture recipient name, delivery outcome and notes.
4. Capture required delivery photos before completing signature/POD where policy requires it.
5. Capture signature or a configured alternative such as authority to leave.
6. Review evidence and confirm delivery.
7. Show whether completion is stored locally, waiting for upload or acknowledged by the server.

Delivery policies must explicitly define required recipient details, scans, photos, signature, authority-to-leave rules and permitted exceptions. Both the app and server enforce the same versioned policy.

Failed attempts record an outcome code, notes, attempted items and required evidence. They create an operational exception for dispatch; they do not silently close the job. Dispatch chooses retry, return, transfer or cancellation.

## 5. State and exception handling

Suggested stop states:

`assigned → accepted → en_route → arrived → completed`

Additional outcomes: `attempt_failed`, `cancelled`, `reassigned`.

Suggested job states:

`booked → ready_for_dispatch → assigned → in_progress → delivered_pending_evidence → completed`

Additional outcomes: `on_hold`, `partially_delivered`, `return_required`, `cancelled`.

Job states are derived from stop and item outcomes where possible. Delivery completion and evidence synchronisation are separate dimensions. A job becomes completed only after required operational events and evidence are accepted by the server.

Reject impossible transitions on the server. Keep a version for optimistic concurrency. Permit retrospective corrections only through authorised compensating events with a reason; preserve the original record.

Batch arrival must enumerate affected stops and return results for each. Never infer that all batch members succeeded from one successful member.

## 6. Dispatcher portal

- Booking form with customer, service, references, shipment and stop details.
- Unallocated queue with filters for service, base, ready time and exceptions.
- Allocation to an available driver/vehicle with acknowledgement status.
- Run editing and manual stop sequencing with validation of pickup-before-delivery dependencies.
- Fleet map showing latest position, position age, accuracy and tracking availability.
- Job timeline showing assignment, acceptance, scans, pickup, delivery and evidence status.
- Exception queue for failed attempts, scan discrepancies, damage, stale tracking and sync conflicts.
- Driver messaging with delivery/read indicators that distinguish queued, received and read.
- Controlled reassignment, cancellation and completion correction with audit reasons.

A stale position must not appear to be a current live location. A geofence can suggest arrival, but location alone does not prove collection or delivery.

## 7. Customer portal

Customers can create bookings, view their jobs, track public milestones and access permitted POD records. Provide a booking acknowledgement and stable reference.

Public tracking uses a scoped, revocable token with expiry and rate limits. Expose only necessary delivery information; do not publish a driver's full location history, internal notes or unrestricted signatures. Live customer location sharing is a separate policy decision.

## 8. Offline and synchronisation

Use an encrypted local database for assigned work, forms, events and evidence metadata. Save each event and its outbox entry atomically before showing it as recorded. Store media locally until the server confirms upload and association.

Each mutation carries a stable UUID idempotency key reused for every retry. The server scopes deduplication to company and operation, checks request identity, and returns the original result for repeated submissions. Deduplication retention must cover the supported offline period.

Synchronisation order:

1. Re-establish authentication and fetch assignment/policy changes.
2. Submit queued events in dependency order, using assignment and resource versions.
3. Upload evidence through resumable or retryable transfers with integrity checks.
4. Finalise the evidence record and obtain server acknowledgement.
5. Fetch reconciled job state and update local records.

Retries use bounded exponential backoff with jitter. Permanent validation errors go to a visible action queue. Do not discard events because authentication expired or an upload timed out.

Conflict rules:

| Conflict | Required behaviour |
| --- | --- |
| Duplicate submission | Return original outcome without another transition |
| Reassigned job | Preserve local evidence; reject stale authority and create review item |
| Cancelled job | Preserve attempts and evidence; require dispatch resolution |
| Changed delivery policy | Validate the captured policy version; request explicit resolution if necessary |
| Out-of-order event | Defer or reject with an actionable dependency error |
| Device clock drift | Preserve device time; use server receipt time for authoritative ordering |
| Media upload failure | Keep delivery pending evidence and retry without duplicating POD |

Show outbox count, last successful sync, pending uploads and conflicts. Warn before logout or local data removal when unsynced work exists. Define supported offline session duration and local retention before production rollout.

## 9. Proposed architecture

Start with a modular backend and one transactional relational database. Separate modules by ownership while avoiding distributed transactions during the first release.

- Mobile client: local database, sync worker, scanner, camera, signature capture and OS location services.
- Web clients: dispatcher, customer and administration experiences.
- API: authentication enforcement, booking, dispatch, execution, evidence, messaging and reporting modules.
- Database: relational operational records and append-only audit events.
- Object storage: private photos/signatures with restricted access and lifecycle policies.
- Background workers: media processing, notifications, integration delivery and retries.
- Realtime channel: operational update hints; clients recover authoritative state through API sync.
- Integration adapter: versioned interface for any verified RTMS, accounting or customer systems.

Use a transactional server outbox for reliable background publication. Push notifications and realtime messages are prompts to fetch state, not the authoritative job record.

Native mobile capabilities are needed to evaluate dependable background tracking, camera access and OS-managed sync. A browser prototype can validate workflows but cannot establish production background-location reliability.

## 10. Core records

| Record | Key contents |
| --- | --- |
| Company / Base | Ownership boundary, timezone, operational configuration |
| User / Role | Identity-provider subject, permissions, account scope |
| Driver / Vehicle / Shift | Operational identity, vehicle properties, availability |
| Customer / Service | Booking account, contacts, service and evidence rules |
| Job | Customer, reference, service, state, revision |
| Consignment / Item | Quantity, weight, dimensions, barcode and item outcome |
| Stop / Leg / Run | Location, windows, instructions, sequence and assignments |
| Assignment | Driver, vehicle, version, acknowledgement and validity |
| OperationalEvent | Actor, type, client ID, occurrence/receipt times and payload |
| Scan | Identifier, item association, stop, result and override reason |
| DeliveryAttempt / POD | Outcome, recipient, policy version and evidence associations |
| Evidence | Object key, content type, checksum, capture metadata, upload status |
| LocationSample | Driver/shift, coordinates, accuracy, sample and receipt times |
| Message | Participants, body, context and delivery/read states |
| Exception | Type, severity, owner, resolution and linked records |
| AuditEvent | Action, actor, resource, reason and safe change metadata |
| IntegrationDelivery | Destination, event ID, attempts and final outcome |

Use UTC storage with explicit operational timezone for display and scheduling. Store money as fixed-precision amounts with currency. Declare units for weights and dimensions. Version evidence policies and API payloads.

## 11. Initial API contract

All routes below are proposals. Use a versioned API, structured validation errors, pagination, request IDs and server-enforced company scope.

| Operation | Proposed endpoint |
| --- | --- |
| Current identity and permissions | `GET /v1/me` |
| Start/end shift | `POST /v1/shifts`, `POST /v1/shifts/{id}/end` |
| Driver assignments | `GET /v1/assignments?cursor=...` |
| Job details | `GET /v1/jobs/{id}` |
| Customer/operator booking | `POST /v1/jobs` |
| Allocate or reassign | `POST /v1/jobs/{id}/assignments` |
| Update run sequence | `PUT /v1/runs/{id}/sequence` |
| Submit operational event | `POST /v1/jobs/{id}/events` |
| Prepare/finalise evidence | `POST /v1/evidence/uploads`, `POST /v1/evidence/{id}/finalise` |
| Submit location samples | `POST /v1/location/batches` |
| Send/read messages | `POST /v1/messages`, `GET /v1/messages?cursor=...` |
| Delivery history | `GET /v1/deliveries?from=...&to=...` |
| Recover sync changes | `GET /v1/sync?cursor=...` |
| Scoped public tracking | `GET /v1/tracking/{token}` |

Mutation envelopes include `clientEventId`, `occurredAt`, `assignmentVersion`, `resourceVersion` and typed payload where applicable. Enforce idempotency with a persisted server record. Return acknowledged event ID, canonical state, revision and sync status.

Sync cursors must include deletions/revocations, have documented expiry and support a safe full-refresh fallback. Outbound webhooks need signed payloads, stable delivery IDs and retry visibility. Consumers must tolerate duplicates.

## 12. Security, privacy and evidence integrity

- Encrypt network traffic and protect locally stored work with OS-backed key storage.
- Require strong authentication and appropriate additional protection for privileged users.
- Restrict evidence storage and issue short-lived, authorised download/upload access.
- Validate uploaded type, size and content; quarantine suspicious files before serving.
- Preserve original evidence with hashes and controlled amendment records.
- Keep secrets and signing credentials out of clients, logs and source control.
- Minimise recipient and location data; make tracking visible to the driver.
- Define retention, deletion, export and legal-hold policy with the operating organisation.
- Keep audit logs free of credentials and unnecessary sensitive payloads.
- Test backup restoration and restrict administrative evidence access.

A signature image and GPS coordinate provide operational evidence; stronger identity or tamper-evidence requirements need explicit product and legal decisions.

## 13. Proposed quality targets

These are acceptance targets to validate in a representative pilot, not measured guarantees.

| Area | Initial target |
| --- | --- |
| Connected assignment visibility | 95% visible within 10 seconds of allocation |
| Local action durability | Event survives app restart immediately after local confirmation |
| Duplicate handling | Repeating the same event creates one authoritative effect |
| Offline pilot | Full assigned pickup/delivery run survives a 4-hour network outage |
| Recovery | Pending events resume automatically after reconnect and reauthentication |
| API latency | 95th percentile under 1 second for routine requests at agreed pilot load |
| Availability | Proposed 99.9% monthly for operational API, subject to budget and deployment design |
| Tracking | Configurable sampling; measure battery use and staleness on supported devices |
| Accessibility | Web keyboard support, labelled controls and readable mobile touch targets |
| Recovery objectives | Agree RPO/RTO before launch and demonstrate a restore drill |

Capacity planning needs driver count, peak bookings, location frequency, media size and retention. Avoid selecting infrastructure tiers before those inputs are known.

## 14. Delivery phases

### Phase 0 — Decisions and workflow prototype

Confirm operating model, terminology, policies, roles and integration availability. Prototype the driver queue, pickup, delivery/POD and dispatcher allocation. Use synthetic data and label simulation clearly.

### Phase 1 — Operational MVP

Implement authenticated roles, booking, assignments, shifts, driver execution, scans/manual fallback, photos, signatures, required evidence, messaging, history, audit trail and offline sync. Add a dispatcher queue, job timeline and fleet map with stale-location indicators. Pilot end to end with real devices and a controlled operating group.

### Phase 2 — Customer and operational expansion

Add customer self-service booking/tracking, returns, partial delivery, multi-stop runs, geofence suggestions, configurable forms, richer exception management and verified external integrations.

### Phase 3 — Optimisation and commercial operations

Add constrained route optimisation, ETA models, tariffs, accounting exports/invoicing and analytics. Specify service windows, vehicle capacity, driver restrictions and pickup precedence before selecting an optimisation engine.

## 15. Release acceptance scenarios

1. A customer booking is allocated, accepted, collected and delivered; dispatch and customer views show the permitted final state and POD.
2. Required photo/signature rules block completion in both client and API until satisfied.
3. Duplicate scans and repeated network requests create no duplicate item movement or POD.
4. A driver completes work offline, restarts the app, reconnects and synchronises the original events and media successfully.
5. Reassignment during offline work produces a visible conflict and preserves captured evidence.
6. Failed delivery creates an exception; an authorised retry or return retains prior attempt history.
7. Users cannot access another company or customer account by changing resource IDs.
8. Fleet views label stale or unavailable tracking correctly.
9. A failed upload remains recoverable and cannot make a job falsely appear evidence-complete.
10. Manual sequence changes cannot place delivery before required pickup.
11. Revoked access and expired sync cursors recover without exposing removed assignments or deleting pending evidence silently.
12. Operations can trace a completion, correction and integration delivery through audit records.

## 16. Decisions required before implementation

- Standalone replacement or integration with an existing RTMS? If integration, obtain authorised API contracts and a test environment.
- Target mobile platforms, supported devices, scanner hardware and distribution method.
- Company/base model, driver employment model and customer account hierarchy.
- Required evidence and exception rules by service/customer.
- Whether partial pickup/delivery, transfers and returns belong in the first release.
- Identity provider, offline access duration and device management requirements.
- Tracking purpose, sampling frequency, retention and permitted customer visibility.
- Hosting region, expected scale, budget and recovery requirements.
- Mapping/navigation provider and route optimisation scope.
- Pricing, tax, invoicing and accounting integration requirements.

## 17. Implementation boundary

No application code, deployment or SICAB connection is included in this specification. The next implementation milestone is a workflow prototype backed by a defined data model, followed by the operational MVP. Validate the open decisions before committing to production integrations or infrastructure.
