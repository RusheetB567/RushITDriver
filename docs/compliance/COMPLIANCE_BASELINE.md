# Rush IT — compliance, privacy and information governance baseline

7 October 2026 · DRAFT assessment · initial jurisdiction: Australia. No production approval or legal compliance certification has been issued. The product remains a courier platform; the supplied CareConnect image is a visual reference, not a change to healthcare processing.

## 1. Regulatory applicability assessment

The operating legal entities, annual turnover, customer contracts, worker classifications and operating states are not confirmed. Privacy Act/APP coverage must therefore be assessed for the platform operator and each relevant activity; a small pilot is not proof of exemption. The employee-records exemption is limited and does not automatically protect a SaaS contractor handling another employer's data. See [OAIC rights and responsibilities](https://www.oaic.gov.au/privacy/privacy-legislation/the-privacy-act/rights-and-responsibilities) and [employee-records guidance](https://www.oaic.gov.au/privacy/privacy-guidance-for-organisations-and-government-agencies/organisations/employee-records-exemption).

Australian APPs are the proposed privacy design baseline while coverage is resolved. State/territory surveillance, employment, transport, contract and recordkeeping duties require activity-specific review. NSW workplace surveillance is governed by its [Workplace Surveillance Act](https://legislation.nsw.gov.au/view/html/inforce/current/act-2005-47); SA also has [surveillance-device legislation](https://www.legislation.sa.gov.au/_legislation-documents/lz/c/a/surveillance-devices-act-2016/current/2016.2.auth.pdf). Do not extend a state's rules to every Australian worker.

Heavy-vehicle/fatigue/chain-of-responsibility obligations depend on actual operations and parties. A shift timer is not a certified work diary or proof of transport compliance. Use [NHVR primary-duty guidance](https://www.nhvr.gov.au/safety-accreditation-compliance/chain-of-responsibility/the-primary-duty/primary-duty-scope) for specialist review. Dangerous goods, payment/tax retention and international obligations are separate assessments if those features become in scope.

## 2. Compliance obligations register

Source APP references mean the [OAIC Australian Privacy Principles](https://www.oaic.gov.au/privacy/australian-privacy-principles). Applicability classification is distinct from implementation status. Review date for all initial rows: 7 October 2026; revisit at the stated gate and any material scope/provider change.

| ID | Source / requirement | Applicability | System impact / required control | Owner | Evidence / current status |
| --- | --- | --- | --- | --- | --- |
| CO01 | Privacy Act coverage and exemptions | REQUIRES LEGAL REVIEW | Document entities/turnover/activities/worker/customer relationships | Legal/privacy | Signed coverage assessment; OPEN before production |
| CO02 | APP 1 governance/transparency | REQUIRES LEGAL REVIEW | Accurate actual-practice policy, complaint owner and governance records | Privacy/PO | Approved policy/process/training; NOT STARTED |
| CO03 | APP 3/5 necessary collection and notices | REQUIRES LEGAL REVIEW | Minimise fields, contextual notices at login/GPS/evidence/customer touchpoints | Product/privacy | Field justification and notice/version records; PARTIAL login notice |
| CO04 | APP 6 purpose-limited use/disclosure | REQUIRES LEGAL REVIEW | Purpose and role/data scope; no unrelated HR/analytics reuse | Privacy/security | Data access tests and purpose register; PARTIAL |
| CO05 | APP 8 overseas disclosure | REQUIRES LEGAL REVIEW | Assess providers/regions/subprocessors and use-vs-disclosure arrangements | Vendor/privacy | Contract and transfer assessment; OPEN |
| CO06 | APP 11 protection and disposal | REQUIRES LEGAL REVIEW | Private storage, credential/access controls, retention/deletion incl backups | Security/records | Tests, retention jobs and restore evidence; PARTIAL auth only |
| CO07 | APP 12/13 access/correction | REQUIRES LEGAL REVIEW | Verified privacy request workflow; amendments preserve original evidence | Privacy/domain | Locate/export/amendment/response tests; NOT STARTED |
| CO08 | Notifiable Data Breaches scheme | REQUIRES LEGAL REVIEW | Prompt assessment/escalation and harm/remediation/notification decision records | Privacy/security | Tabletop and incident log evidence; NOT STARTED |
| CO09 | Workplace monitoring/state surveillance | REQUIRES LEGAL REVIEW | Worker/jurisdiction analysis, appropriate notices and shift policy | HR/legal/operations | Approved monitoring plan; NOT STARTED |
| CO10 | Contractual data/SLA/notification duties | PARTIALLY APPLICABLE | Register each actual signed obligation; tenant rules cannot disable platform minima | Legal/vendor | Contracts not supplied; OPEN |
| CO11 | Heavy vehicle/fatigue/dangerous goods | REQUIRES LEGAL REVIEW | Determine vehicles/materials/modes/roles before feature claims | Operations/legal | Applicability evidence not supplied; OPEN |
| CO12 | App-store collection/permissions declarations | APPLICABLE to planned store release | Match declarations to shipped SDKs and actual collection | Mobile/privacy | SDK/permission audit and store forms; NOT STARTED |
| CO13 | Biometric authentication/ID verification | NOT APPLICABLE to current build | No biometric or ID collection implemented; assess before introduction | Privacy/security | UI states no biometric login; FUTURE REVIEW |
| CO14 | Public tracking privacy/access | APPLICABLE as product release control | Scoped expiry/revocation/noindex and minimal milestones | Customer/security | No tracking service yet; NOT STARTED |
| CO15 | Payment card processing | NOT APPLICABLE to current build | Do not introduce raw card data; reassess processor responsibilities | Finance/security | No card processing; FUTURE REVIEW |
| CO16 | AI/automated driver decisions | NOT APPLICABLE to current build | No external training or disciplinary/allocation decisions without governance | Product/privacy | No AI processing; FUTURE REVIEW |

Legal coverage status does not waive proposed safeguards. Sources support the issues to assess; this register does not establish an entity-specific legal conclusion.

## 3. Personal information inventory

Rows below form one inventory by ID across both tables. CURRENT = authenticated local build; PROTOTYPE = separate synthetic browser demo; PLANNED = not implemented. Each named element in a row shares that processing record; split records when purposes/providers/retention differ. Actual records and consent/legal bases require operator validation.

| ID / data elements | Subject | Purpose | Source / collection method | System / state | Classification |
| --- | --- | --- | --- | --- | --- |
| PI01 name, email, organisation, role | User/driver/admin | Identity and scoped account access | User/admin; authorised login/provision/account form | Identity DB / CURRENT | CONFIDENTIAL |
| PI02 salted password hash, salt | Account user | Password verification | Password supplied to local service; scrypt derivation | Identity DB / CURRENT | RESTRICTED |
| PI03 hashed session token, creation/expiry, session cookie | Account user | Authenticated session/revocation | Server random issuance; browser cookie | Session DB/browser / CURRENT | RESTRICTED |
| PI04 IP/Host/Origin, request ID, security errors | User | Request security, investigation | Network request; transient limits/header/error logs | API memory/log output / CURRENT | CONFIDENTIAL |
| PI05 company/customer/contact names | Customer/recipient/company contacts | Booking and coordination | Dispatcher form/configured customer record | Customer/job-leg DB / CURRENT | CONFIDENTIAL |
| PI06 street address, suburb, contacts/phone | Sender/recipient | Pickup/delivery fulfilment | Dispatcher booking form | Job-leg DB / CURRENT | CONFIDENTIAL |
| PI07 reference, instructions, service/windows, shipment counts/weight/volume | Customer/recipient/driver where identifiable | Execute service | Dispatcher form | Jobs/consignment/leg DB / CURRENT | CONFIDENTIAL; instructions may require RESTRICTED treatment |
| PI08 driver assignment, shift start/end/state, activity | Driver | Work allocation/availability | Dispatch command; driver shift command | Assignment/shift DB / CURRENT | CONFIDENTIAL |
| PI09 GPS coordinates, accuracy, sampled/receipt time | Driver | Optional event location evidence | Driver explicitly requests one browser GPS sample | Job-event DB / CURRENT | RESTRICTED |
| PI10 actor, action, before/after status, occurrence/receipt time, failure notes | User/driver/customer where identifiable | Operational audit and disputes | Validated command/event insertion | Events/audit DB / CURRENT | CONFIDENTIAL; notes may be RESTRICTED |
| PI11 recipient name, signature, delivery photo/notes/time | Recipient/driver/by-standers | Delivery proof | Demo file/canvas/forms | Browser localStorage / PROTOTYPE only | RESTRICTED; use synthetic data only |
| PI12 package IDs/barcodes/QR/scan history | Customer/recipient/driver where linkable | Freight custody/verification | Camera/manual/scanner | Package/scan domain / PLANNED | CONFIDENTIAL |
| PI13 photo/signature/POD, actor/device/location/hash | Recipient/driver/by-standers | Required evidence and disputes | Native camera/signature/POD capture | Private object store + metadata / PLANNED | RESTRICTED |
| PI14 OTP/PIN verification state | Recipient/customer | Delivery verification | Scoped challenge/input | POD verification / PLANNED | RESTRICTED; no raw value retention after purpose ends |
| PI15 licence/certification/expiry/contact/employment classification | Driver/contractor | Service eligibility/fleet compliance | Authorised driver/admin records | Driver/fleet; HR kept separate / PLANNED | RESTRICTED |
| PI16 registered device ID/platform/app version/push token/last activity | Driver/user | Device access and notifications | Native registration/session telemetry | Device/notification domain / PLANNED | RESTRICTED identifiers |
| PI17 continuous coordinates/heading/speed/route/vehicle movement | Driver | Shift operational visibility | Policy-controlled native sampling | Location domain / PLANNED | RESTRICTED |
| PI18 messages, attachments, acknowledgement | Driver/dispatch/customer if included | Operational communication | Scoped sender form/files | Messaging/evidence / PLANNED | CONFIDENTIAL or RESTRICTED content |
| PI19 incidents/injury/defects/fatigue and attachments | Driver/third parties | Safety/incident response | Driver report/authorised reviewer | Incident/fleet domain / PLANNED | RESTRICTED; may be legally sensitive information |
| PI20 rates/charges/invoices/settlements/billing contacts | Customer/contractor | Billing/account reconciliation | Approved finance rules and outcomes | Finance domain / PLANNED | CONFIDENTIAL financial; restricted settlement detail |
| PI21 public tracking token, permitted milestones/view events | Customer/recipient/viewer | Minimal delivery status | Random scoped issuance; guest view | Tracking/security / PLANNED | RESTRICTED token; CONFIDENTIAL milestones |
| PI22 privacy requests/notices/access review/approval records | Requester/user | Information governance | Verified request, authorised review | Governance/audit / PLANNED | RESTRICTED case material |

| ID | Users with access | Third parties | Storage location | Retention / deletion | Legal/business basis to confirm |
| --- | --- | --- | --- | --- | --- |
| PI01–03 | Own profile; org admin limited metadata; server-only hashes | None configured for auth | Local Desktop `.data/rushit.sqlite`; HttpOnly cookie | RET01/02; revocation/session expiry cleanup and account deletion workflow | Authentication/organisation operation; not blanket consent |
| PI04 | API/security reviewer; not dispatcher credential telemetry | None configured; hosting/log providers later | Runtime memory and local server output | RET03; log rotation/expiry not implemented | Security/incident investigation |
| PI05–07 | Org admin/dispatcher; assigned driver; customer scope later | Google Maps only when navigation link clicked; address/suburb sent | Local DB; selected map provider receives query | RET04; record amendments/deletion per approved schedule | Delivery fulfilment; source notice/account contract |
| PI08 | Driver, org admin/dispatcher availability | None configured | Local DB | RET05; break history not independently modelled yet | Operations; worker-monitoring review required |
| PI09 | Org admin/dispatcher and assigned driver via event detail | Browser/OS location provider; processing arrangements unassessed | Local event DB | RET06; no automated deletion implemented | Optional operational evidence; collection purpose/notice required |
| PI10 | Scoped operational users; org admin audit | None configured | Local DB | RET07; retention-aware archival required; immutability must allow authorised governance | Audit/dispute/security purpose |
| PI11 | Anyone with that prototype browser profile | None uploaded to backend | Prototype browser storage | RET08; explicit demo reset/local deletion; no backup guarantees | No production authority; synthetic review only |
| PI12–14 | Assigned driver; permitted operations/customer POD roles | Storage provider TBD; PIN provider if chosen | Provider/region TBD | RET08; finalised media/metadata/cache/backups governed together | Necessary delivery evidence; no unrelated identity reuse |
| PI15 | Eligibility fields to operations; restricted documents to authorised fleet/HR | Verification provider only if approved | Provider/region TBD | RET09; legal/contract retention review | Eligibility and applicable employer/transport duties |
| PI16–17 | Own driver; scoped security/dispatch, not full customer trail | Cloud/push/location providers TBD | Provider/region TBD | RET06/10; cease off-shift collection, expire scoped caches | Shift/device purposes; jurisdiction/worker review |
| PI18–19 | Conversation parties; incident reviewers; restricted HR separation | Approved file/notification providers only | Provider/region TBD | RET11/12; content-specific hold/correction/deletion | Operational/safety purposes; incident sensitivity review |
| PI20 | Authorised finance/customer accounts, not full GPS scope | Accounting/payment provider TBD | Provider/region TBD | RET13; taxation/contract review, no universal duration assumed | Billing and applicable recordkeeping |
| PI21 | Token holder sees minimum permitted outcome; support/security metadata | Hosting provider TBD; no search indexing | Provider/region TBD | RET14; token expiry/revocation and access-log schedule | Customer service with forwarding-risk review |
| PI22 | Privacy/security case owner; requester limited own response | Legal/approved support provider if necessary | Provider/region TBD | RET15; scoped case archive/disposal and evidence of response | Applicable rights/governance/accountability |

## 4. Data classification standard

PUBLIC: approved product identity/marketing, never operational records by default. INTERNAL: nonpersonal configuration/process docs. CONFIDENTIAL: account/customer/booking/activity metadata. RESTRICTED: credentials/tokens, precise location, signatures/photos, identity/health/incident information and privacy cases. These are product handling labels; they do not automatically establish legal sensitive-information classification.

Controls increase with sensitivity: scoped access, private authenticated retrieval, encrypted transport/storage, limited export, no diagnostics/analytics payloads, access review/audit and shorter justified retention. Never expose credential hashes to account APIs or include private evidence in public tracking pages.

## 5. Data flows

| Flow | Sender → recipient / purpose / information | Jurisdiction / provider |
| --- | --- | --- |
| DF01 current | User browser → loopback API → DB; identity/password verification → hash/session; authenticated scoped profile returned | User's local Windows machine; no remote IdP |
| DF02 current | Dispatcher → API/DB → assigned driver through scoped query; booking/assignment data | Local machine; same organisation checks |
| DF03 current | Driver explicit GPS request → browser/OS → API/event DB → permitted event viewers | Location-service implementation varies; vendor assessment pending |
| DF04 current | Job-detail navigation click → Google Maps; address/suburb query for directions | Google processing region/terms not assessed; no job/driver ID in query |
| DF05 current | Domain command → transactional events/audit/outbox → SSE invalidation → refetch scoped data | Local machine; realtime hints contain no job detail |
| DF06 prototype | Synthetic photo/signature form → browser localStorage only | Browser device; not authorised production evidence |
| DF07 planned | Native driver → private object upload → finalisation/POD metadata → permitted operations/customer retrieval | Storage/CDN/provider/region TBD |
| DF08 planned | Encrypted native cache/outbox → sync API → acknowledgements/conflict queue | Device + approved hosting; provider TBD |
| DF09 planned | Shift sampling → location API → scoped fleet map; minimum customer milestone if authorised | Hosting/maps/push providers TBD |
| DF10 planned | Domain event → notification/adapter → recipient/customer/partner | Provider/contract/region TBD; no rich lock-screen payload |
| DF11 planned | Approved transactional outcomes → reporting/finance; later minimised analytics | Provider/region/access purposes TBD |

## 6. Draft privacy impact assessment

Screened high risk: worker monitoring, exact location, recipient/by-stander imagery/signatures, public tracking forwarding, offline/stolen device, privileged support and external processors. No biometric/AI/ID processing exists; each introduction triggers another PIA.

Current mitigations: organisation/assignment checks, salted passwords, hashed revocable sessions, output escaping, limited explicit GPS samples, no continuous tracking, no public tracking/evidence service. Remaining weaknesses: no retention worker/private production evidence/mature permissions/read-access audit, no native encrypted queue or vendor decisions. Residual risk is unacceptable for real courier operations until CF01–08 are resolved. Assessment is draft, needs operator facts and privacy/security/product review. Follow [OAIC PIA guidance](https://www.oaic.gov.au/privacy/privacy-guidance-for-organisations-and-government-agencies/privacy-impact-assessments/guide-to-undertaking-privacy-impact-assessments).

## 7–8. GPS and worker monitoring assessments

Current build: optional fresh GPS attached to a command; no continuous background tracker. Planned policy must define why, shift start/finish and break/unavailable behaviour, adaptive sampling, accuracy/staleness, current/history viewers, retention and employee/contractor notices. Default: stop operational tracking off shift; no customer full trail; dispatch current operational view, historical access only for authorised investigation. These are proposed controls, not approved legal settings. Determine worker classification and every operating jurisdiction; notice/consent analysis is not replaced by a browser permission prompt.

## 9. Retention schedule

No production periods have been approved. Duration TBD is a release blocker, not permission to retain forever. Under APP 11, covered entities' disposal obligations need purpose/exception assessment; see [OAIC securing-personal-information guidance](https://www.oaic.gov.au/privacy/privacy-guidance-for-organisations-and-government-agencies/handling-personal-information/guide-to-securing-personal-information).

| Policy | Category / trigger | Proposed control / required decision |
| --- | --- | --- |
| RET01 | Account after departure/tenant termination | Export window, suspension, documented hold and expiry/deletion across related records |
| RET02 | Sessions/credentials | Current sessions expire after eight hours and logout revokes; expired-row cleanup/credential lifecycle pending |
| RET03 | Request/security logs | Risk-based bounded duration; restricted access and redacted rotation |
| RET04 | Jobs/customer booking records | Contract/dispute purpose and retention basis; archive/amendment/legal hold |
| RET05 | Shift/activity | Worker jurisdiction/business basis; limited use beyond operations |
| RET06 | GPS | Short justified operational period; longer incident hold only with explicit basis |
| RET07 | Audit/events | Accountability/dispute period; protected amendments plus retention-aware archival |
| RET08 | POD/photo/signature | Customer/service need, claims and incidental-capture risk; securely expire media/cache/derived copies |
| RET09 | Licences/certifications | Prefer verified eligibility rather than full documents; delete superseded copies as justified |
| RET10 | Device/push records | Revoke/delete on departure/device replacement; no stale token distribution |
| RET11 | Messages | Operational/dispute purpose; minimise attachment retention |
| RET12 | Incidents | Sensitivity and workplace/insurance/legal holds determine period and reviewers |
| RET13 | Financial records | Applicable finance/tax/contract schedule separately approved |
| RET14 | Tracking links/views | Expiring revocable tokens; bounded visitor logs; no indexing |
| RET15 | Privacy/governance cases | Evidence of response/decision, access restrictions and closure-based disposal |

## 10. Deletion procedure

Verify authority/identity → locate scope and lawful holds → approve/export if appropriate → restrict access → delete/anonymise primary DB/object/cache/search/derived records → record proof without reproducing deleted personal data → apply backup expiry and prevent resurrection on restore. Backups may not support immediate selective erasure; document isolation/expiry and reapply deletion markers after restoration. Current append-only triggers need a controlled retention design; ad-hoc DB deletes are not a compliant process. Terminating tenants need explicit export/suspension/retention/deletion confirmation.

## 11–12. Notice and privacy policy requirements

Login: identity/credential/session purpose and local build limitation (implemented explanatory dialog). GPS: specific collection timing/purpose/access/retention before native tracking. Camera/signature: capture required evidence without unnecessary people/documents; contextual recipient information; correction pathway. Public tracking: visible limited scope, forwarding and expiry. Contacts/account forms: source/use and access/correction/complaint channel. Every published policy must name actual legal operator/contact, providers/regions, actual purposes/retention, rights/complaints and overseas handling; those facts are not supplied. No generic production policy is published.

## 13. Role/data access matrix

| Role | Needed visibility | Excluded by default |
| --- | --- | --- |
| Driver | Own active work and required recipient/address/evidence capture | Other drivers/customers; HR/finance; unrelated location history |
| Dispatch | Own operational scope, current location/status, job/exception/POD as permitted | Passwords/tokens, full HR/settlement/identity documents |
| Org admin | Scoped configuration/users and audited operational admin tasks | Other tenants; raw credentials; unlimited biometric/HR access |
| Fleet/HR | Eligibility/vehicle matters with dedicated grants | Recipient evidence/full trails unless required for case |
| Finance | Approved charges/invoices/customer billing | Complete GPS/signatures/incident health detail |
| Customer | Own milestones/permitted POD and account records | Driver private phone, unrelated jobs, internal notes/full trail |
| Public tracking holder | Minimum scoped milestone | Unrestricted POD signature/private recipient/driver data |
| Support/auditor | Scoped time-limited authorised case access with logs | Universal tenant browsing or routine DB writes |

Only admin/dispatcher/driver roles exist today. Full permission/branch/customer matrices are not implemented or compliance-approved.

## 14–16. Cross-border/vendor register and due diligence

Provisioning and API data are currently local. Google Maps receives an address query on user click. No hosted email/SMS/auth/storage/analytics/crash provider is configured. Prototype CSS can request a Google font; the authenticated build uses system fonts. Current third-party processing region/contracts/subprocessors remain unverified. Assess overseas use/disclosure using actual contractual/control arrangements, not merely a region selector. See [OAIC overseas guidance](https://www.oaic.gov.au/privacy/privacy-guidance-for-organisations-and-government-agencies/handling-personal-information/sending-personal-information-overseas).

| Vendor/service | Data/purpose | Region | Security/privacy/contract/subprocessors | Review/status |
| --- | --- | --- | --- | --- |
| Local Windows/browser/OS location | Runtime files/session; optional location acquisition | Device in user's operating jurisdiction; location provider unknown | Local device security and provider behaviour review needed | 7 Oct / PARTIAL |
| Google Maps external navigation | Address/suburb navigation query | Not established | No vendor review/contract/subprocessor evidence recorded | 7 Oct / OPEN |
| Google Fonts legacy prototype | Font request/browser network metadata | Not established | Remove/review before shipping legacy prototype; not used in authenticated UI | 7 Oct / OPEN |
| Hosting/storage/IdP/maps routing/email/SMS/push/diagnostics | Future necessary scoped processing only | TBD | No provider appointed; assess before integration | Pending / NOT STARTED |

Due diligence must record necessity/data, region and support access, security assurances, encryption/access/logging, incidents/notification timing, subprocessors/change terms, deletion/export/backup behaviour, vendor use for AI, availability/exit plan and review owner/date. Contracts address permitted processing/confidentiality/incident cooperation and deletion. No unnecessary recipient/GPS/signature content goes to analytics/crash reports or notification previews.

## 17. Breach response procedure

Discover → preserve evidence/contain → security and privacy case owners → determine affected data/tenants/people/access → assess likely harm and remediation → decide applicable notification duties → notify when required → remediate/review. Keep security incidents distinct from eligible privacy breaches; contracts may impose additional duties. Where the NDB scheme applies, assessments must be reasonable and expeditious, taking reasonable steps to complete within 30 calendar days; notification is prompt once grounds establish eligibility, not deferred until day 30. See [OAIC NDB response guidance](https://www.oaic.gov.au/privacy/notifiable-data-breaches/preventing-preparing-for-and-responding-to-data-breaches/data-breach-preparation-and-response/part-4-notifiable-data-breach-ndb-scheme).

Record awareness time, affected records/subjects, access evidence, containment, harm reasoning/remediation, reviewer decisions, deadlines and notifications. Current logs cannot fully answer every read/export access question. Name escalation owners and conduct a tabletop before pilot; no notification has been sent by this document.

## 18. Privacy request procedure

Receive securely → verify identity without excessive ID collection → clarify scope/entity → search authoritative domains → review rights/exceptions/legal holds → export/correct via controlled amendment when appropriate → response/complaint pathway → audit. Corrections to POD preserve original plus linked correction; they do not silently erase history. Response timing must follow applicable confirmed obligations, not a universal invented number.

## 19–20. Information governance and records

Identity owns user authority; customer domain owns account/site data; job event ledger owns execution state; POD owns accepted evidence; finance owns approved charges. Records include booking, attempts, notices/policy versions, POD, invoices and privileged changes. Every change needs controlled provenance. Separate HR data from operational eligibility, and evidence custody from mutable display fields. Establish access review and join/move/leave controls; owner and review frequency are pending, with more frequent privileged review proposed. Training covers dispatch privacy, careful photo framing, credentials, tracking and support access.

## 21–22. Permissions and app-store review

| Permission | Purpose/timing | Current status / release evidence |
| --- | --- | --- |
| Location | Explicit event sample; planned policy shift tracking | Browser request on driver click; native purpose/background/retention assessment pending |
| Camera/photos | Package scan and necessary evidence | Authenticated build not implemented; no permission requested |
| Notifications | Minimal new-work/message alerts | No push service; request only when implemented and explained |
| Bluetooth | Optional hardware scanner | Not implemented; do not request |
| Biometrics | Future OS-mediated reauthentication | Not implemented; no biometric template collected |

Before store release inspect shipped SDKs/network data, permission purpose strings, background behaviour and declarations for location/photos/identifiers/diagnostics; ensure forms match actual processing. No store privacy declaration has been submitted.

## 23. Findings, risks and remediation plan

All findings reviewed 7 October 2026. Role owners are proposed; individuals/date commitments remain unappointed.

| Finding | Feature / requirement / why | Current state / risk | Required control, owner and evidence | Release impact / status |
| --- | --- | --- | --- | --- |
| CF01 BLOCKER | Coverage/operator/worker monitoring; CO01/09 | Facts missing; inappropriate legal/notice assumption | Legal/privacy/HR: entity/jurisdiction/worker assessment, approved notices | Production gate; OPEN |
| CF02 BLOCKER | POD/files/offline; CO06 | No real private evidence or encrypted sync; loss/leakage risk | Evidence/mobile/security: scoped integrity upload, durable recovery and device tests | Operational pilot blocked; OPEN |
| CF03 BLOCKER | Retention/deletion; CO06/07 | No approved periods/automated disposal; immutable triggers incomplete lifecycle | Records/privacy: schedule, legal holds/deletion/restore suppression tests | Real data/production gate; OPEN |
| CF04 HIGH | Identity/permission/device; CO04/06 | Local salted sessions only; no complete grants/recovery/device control | Security/backend: production identity, least privilege and revocation/access reviews | Production gate; PARTIAL |
| CF05 HIGH | GPS/maps/provider transfers; CO05/09 | Optional samples/maps link; no region/contract review | Privacy/vendor/mobile: minimisation, provider review, policy/battery/stop tests | Before expanded collection; OPEN |
| CF06 HIGH | Breach/support access evidence; CO08 | Minimal errors/mutation audit; no read/export logs/tabletop | Security/privacy/support: redacted access logs and exercised breach workflow | Before pilot/production; OPEN |
| CF07 HIGH | Public tracking/AI/biometric processing; CO13/14/16 | Not implemented; expanding without assessment risks disclosure | Product/privacy: feature PIA, token/noindex/revoke or OS-auth/vendor evaluation | Before introducing feature; NOT STARTED |
| CF08 MEDIUM | Policies/requests/training/store records; CO02/03/07/12 | Login notice only; broader evidence unapproved | Privacy/PO/mobile: accurate docs, request workflow, training and SDK/store audit | Commercial release gate; PARTIAL |

## 24. Compliance release decision

- [ ] Confirm legal entities/activity coverage, worker/jurisdiction and contracts.
- [ ] Approve inventory/flows/PIA, tracking/photography/POD/ATL policy and role visibility.
- [ ] Approve actual providers/regions/subprocessors/contracts and transfer controls.
- [ ] Implement/test retention, deletion, privacy requests and correction integrity.
- [ ] Evidence tenant/file/session/offline/device controls and access reviews.
- [ ] Name incident/privacy/support owners and exercise assessment/restore response.
- [ ] Publish accurate operator privacy/contact notices and train relevant roles.
- [ ] Verify shipped SDK/device permissions and store declarations.
- [ ] Record backend architect, security specialist and compliance reviewer evidence, followed by product/sponsor release decision.

The user's three-role diagram is a separation of review responsibilities. One assistant drafting three perspectives does not constitute independent production approval. Current decision: **NOT APPROVED FOR PRODUCTION**; no person has signed those gates. The local UI/login review can proceed with the authorised account and synthetic operational data.
