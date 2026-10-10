# Rush IT premium platform upgrade

## A. Existing UI audit
Sign-in is branded and functional. Dispatch lists 25 records with limited local filtering; details expose stops, assignments and an immutable event history. Booking, users, audit and active shifts use real APIs. The separate prototype uses mock/localStorage data and is not the authenticated product. Missing: operational dashboard, persistent freight identification, packages/dimensions, document ingestion/review, barcode scans, messages, POD completion, global server search and historical filters. Navigation and detail hierarchy are too sparse. Delivery is intentionally blocked pending evidence.

## B. Navigation
Dashboard; Operations (live queue, unassigned, in progress, completed, exceptions, history); Cargo (consignments, air freight, document intelligence); Dispatch (assignment board, driver availability); Communication; Delivery evidence; Customers; Administration; Settings. Each implemented destination uses scoped backend data. Maps, vehicles and traffic optimisation require integrations and will not masquerade as working services.

## C. Dashboard wireframe
Top: command search, theme, refresh and create booking. Four primary KPI cards with secondary state counters. Centre: operational queue and risk list. Right: driver availability and freight readiness. Bottom: immutable recent events and communication links. Counts come from all scoped jobs, not the current page; no fabricated activity or GPS positions.

## D. Job detail wireframe
Header: reference, status, priority, service, deadline and driver. Metrics: pieces, gross weight, calculated volume and scan readiness. Two stop cards with contacts, windows and navigation. Freight panel separates payer/customer, host company, sender, receiver, carrier and agent. Package table and scan progress. Document links, operational timeline and delivery evidence with recipient, signature/photo and timestamps. Contextual actions respect job state and assigned driver.

## E. Cargo model
Freight consignment: id, organisation, optional job, consignmentNumber, bookingNumber, customerReference, freightReference, purchaseOrder, description, packageType, specialHandling. Parties: client, hostFreightCompany, shipper, consignee, carrier, handlingAgent. Route: origin/destination country, airport, terminal, depot, warehouse and address. Flight: airline, flightNumber, ETA, ATA, departure, availability, cutOff, customsStatus, releaseStatus. Packages: id, barcode, lengthCm, widthCm, heightCm, weightKg, count. Server calculates cubic volume, pieces and weight. Chargeable and volumetric weights are separate supplied values; no invented divisor.

## F. Air waybill relationships
One freight consignment holds distinct AWB, MAWB and HAWB references. These describe the air shipment independently of the local courier job. A job may have multiple freight consignments; each consignment has multiple package rows and documents. Master/house references are independently editable, without pretending an OCR match proves ownership.

## G. Extraction workflow
Upload PDF/JPG/PNG -> bounded local text recognition -> labelled field candidates with source snippets and heuristic quality indicators -> reviewer corrects and explicitly verifies fields -> persistent consignment -> attach to a scoped job or create a booking and link it. Missing/uncertain values are never silently accepted. Confidence is a heuristic, not calibrated probability or AI certainty. Original documents remain authenticated; no cloud document transmission.

## H. Backend changes
Add freight consignments/packages, encrypted cargo documents, extraction/review metadata, scan events, POD evidence, messages/read receipts and shift declarations. Extend scoped APIs for dashboard/search, cargo CRUD/linking, extraction review, package scanning, evidence completion and communication. Preserve optimistic revisions, idempotency, tenant boundaries, shift gating and audit/event transactions. Separate local encryption key from tracked files; production key management and object storage remain release gates.

## I. Screens to create
Dashboard, cargo overview/editor, extraction upload/review, dispatch board, history, communication, POD archive, customer directory and settings.

## J. Screens to replace
Authenticated shell, job queue, job details, driver availability and booking shipment workflow. Preserve functional authentication, admin user creation and audit.

## K. Implementation sequence
1. Schema and scoped cargo services; 2. document ingestion/real recognition/review; 3. packages/scanning/POD completion; 4. dashboard/search/messages; 5. premium responsive shell and connected screens; 6. isolated end-to-end API tests and browser checks; 7. sync Desktop copy without touching Git or user data.

This plan does not authorise deployment or constitute production approval. Camera barcode compatibility, native/offline, maps/traffic, automated OCR accuracy on arbitrary layouts and production infrastructure require further acceptance work.
