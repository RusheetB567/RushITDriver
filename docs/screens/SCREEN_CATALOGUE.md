# Screenshot catalogue — existing system

Evidence date: 7 October 2026. Source: nine user-supplied screenshots, 2.jpeg through 10.jpeg. Original files are on the user's Desktop and are not copied into the repository.

Observed means visible in a screenshot. Inferred means a plausible interpretation requiring verification. Unknown means the evidence does not establish the behaviour. Suggested APIs in the platform blueprint are new design proposals, not discovered SICAB endpoints.

## Navigation map

Observed screen titles: Jobs, Completed Jobs, Messages, Job History Enquiry.

The Jobs hamburger menu lists Message, Batch Leg Action, Barcode Scan, Job History, System Info, Start Break, Sort Job List, Logoff and Exit. Three footer dots appear on Jobs, Completed Jobs and Messages. Their ordering suggests a three-page navigation scheme, but gestures and dot interactions are not demonstrated. The grey side chevron appears across screenshots; its function and whether it belongs to the app are unknown.

## S01 — Jobs menu (2.jpeg)

Purpose: access driver operations from Jobs.

Entry: Jobs hamburger menu is open; the opening action is inferred from the control.

Displayed: an active row with identifier, HH2, D, time-like value, suburb/company and street address. The menu overlays the right side.

Actions: Message; Batch Leg Action; Barcode Scan; Job History; System Info; Start Break; Sort Job List; Logoff; Exit.

Rules: menu presence is observed. Permissions, disabled states and action side effects are unknown. Logoff and Exit are separate entries and must remain separate concepts until their semantics are verified.

Backend: active work and driver state likely come from a service, but no network protocol is observed.

Candidate entities: DriverSession, JobLeg, Message, Break, LogoffRequest.

## S02 — Completed Jobs (3.jpeg)

Purpose: show completed operational rows.

Displayed: four rows; each includes a numeric job identifier, HH2, P or D, time-like value, suburb/company and address. One identifier also appears on the active delivery screen with a P row here.

Inference: P/D likely identify pickup/delivery legs; the repeated identifier supports a leg-based model. HH2 meaning and time semantics are unknown. A displayed 24:00 must not be silently parsed as an ordinary clock value without confirming its meaning.

Actions: hamburger control and footer indicators are visible. Opening rows and navigating between pages are unverified.

Rules/backend: evidence does not prove completion criteria, history retention or pagination.

Candidate entities: Job, JobLeg, LegOutcome.

## S03 — Messages (4.jpeg)

Purpose: show communication with base.

Displayed: entries labelled Base or Driver with date/time and multiline text, newest first in this sample. Some base messages include an operator marker. A fit-for-duty acknowledgement text is visible; it is not proof of a dedicated form or enforced acknowledgement workflow.

Actions: menu and scrolling are visible; composer, send action, read receipt and reply behaviour are not shown.

Rules/backend: sending, transport, read status, offline handling and job association are unknown.

Candidate entities: Message, SenderRole, Operator, Driver.

Private conversation contents are deliberately not transcribed.

## S04 — Batch leg action (5.jpeg)

Purpose: choose a batch operation.

Entry: inferred from Batch Leg Action menu entry.

Displayed prompt: How do you want to perform batch leg action?

Actions: Batch Pickup; Batch Arrive (Delivery); Batch Delivery; Cancel.

Rules: delivery arrival is separate from delivery completion. Selection scope, eligibility, confirmation, partial success and evidence requirements are unknown. The screenshot shows a chooser, not a successful batch operation.

Candidate entities: JobLeg, BatchOperation, PerLegResult.

## S05 — Batch Barcode Scan (6.jpeg)

Purpose: choose scanning context.

Entry: inferred from Barcode Scan menu entry.

Displayed prompt: How do you want to perform batch barcode scan?

Actions: Pickup; Delivery.

Observed rule text: New barcode can be scanned-in on Pickup.

Inference: registering a previously unknown identifier is associated with pickup. Delivery treatment of unknown identifiers, duplicate handling, camera UI and item matching are not demonstrated.

Candidate entities: Barcode, Item, ScanSession, ScanEvent.

## S06 — Job History Enquiry (7.jpeg)

Purpose: query job history within a date range.

Displayed: back control, From and To dates, a result with identifier, HH2, ISO-style date, suburb-to-suburb route and a red #120 badge.

Actions: date fields and back control are visible; query trigger and result-opening behaviour are unknown.

Rules: badge meaning, inclusive boundaries, date timezone and searchable retention are unknown. Do not interpret #120 as status, priority or item quantity without evidence.

Candidate entities: HistoryQuery, JobSummary, UnknownBadgeValue.

## S07 — Sort chooser (8.jpeg)

Purpose: select active job ordering.

Displayed prompt: How do you want to sort job list?

Actions: Sorted by time received; Sorted by suburb; Sort Manually; Cancel.

Observed: checkmark beside Sort Manually.

Rules: direction, tie-breaking, persistence, drag controls and whether ordering affects dispatch are unknown. Do not confuse time received with the row's time-like value.

Candidate entities: SortPreference, ManualLegOrder.

## S08 — Logoff Request Sent (9.jpeg)

Purpose: acknowledge a logoff request while waiting for base.

Observed message says the driver is not yet logged off, base should confirm, and the driver may contact base if no confirmation is received in five minutes.

Actions: OK.

Rule: requested logoff and confirmed logoff are distinct states. Five minutes is guidance to contact base, not evidence of automatic timeout or automatic logout. Pressing OK must not be assumed to end the session.

Candidate entities: LogoffRequest, DriverSession, BaseConfirmation.

## S09 — Logging Off... (10.jpeg)

Purpose: report confirmed logoff.

Observed message says the driver is now logged off and asks them to press OK. Footer indicators change from connected/active-looking symbols to symbols with red crosses.

Actions: OK.

Inference: the indicators relate to connectivity/session state; exact meanings and post-OK navigation are unknown. Screenshot sequence supports request → awaiting confirmation → confirmed logoff, but does not establish the underlying transport.

Candidate entities: DriverSession, LogoffConfirmation.

## Missing evidence

Login, System Info, Start/End Break, Exit, job detail, arrival at pickup, pickup confirmation, camera scanning, recipient/signature/photo capture, failure paths, offline recovery and dispatch screens are not included. No screenshot proves GPS sampling behaviour, production authentication or API endpoints.
