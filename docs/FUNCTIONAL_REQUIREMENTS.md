# Functional requirements — screenshot baseline

These requirements reproduce observed capabilities at a functional level. Unverified details are explicitly open; implementation must not present invented behaviour as established cisdriver3 functionality.

| ID | Requirement | Evidence / qualification |
| --- | --- | --- |
| FR-01 | Provide active job and completed leg lists with identifier, service/code, leg marker, operational time and destination | 2, 3, 5.jpeg; code/time meanings pending |
| FR-02 | Model pickup and delivery legs separately from jobs | Supported by repeated job identifier with P and D; interpretation to confirm |
| FR-03 | Provide the nine observed menu entries | 2.jpeg |
| FR-04 | Display base/driver messages with timestamps and multiline bodies | 4.jpeg; sending UI pending |
| FR-05 | Offer batch pickup, delivery arrival and delivery completion | 5.jpeg; eligibility and selection pending |
| FR-06 | Offer pickup and delivery barcode modes | 6.jpeg |
| FR-07 | Support new barcode scan-in at pickup | 6.jpeg; registration and validation rules pending |
| FR-08 | Provide history enquiry with From/To dates | 7.jpeg; query semantics pending |
| FR-09 | Offer received-time, suburb and manual ordering, indicating selection | 8.jpeg |
| FR-10 | Treat logoff request as pending until base confirmation | 9.jpeg |
| FR-11 | Show confirmed logoff separately and provide acknowledgement | 10.jpeg |
| FR-12 | Keep break, logoff and exit separate operations | Menu evidence only; exact rules pending |

## Proposed safeguards for the replacement

These are design recommendations, not observed behaviours: per-leg batch results, idempotent mutation handling, durable offline events, preserved evidence on conflict, visible sync state, server-side policy enforcement and private recipient data. See the platform blueprint for their design.

## First review acceptance checks

- Screen catalogue covers all nine supplied screenshots and identifies unknowns.
- No production API, service-code meaning or hidden workflow is claimed as discovered.
- Logoff acknowledgement cannot be confused with base confirmation.
- Delivery arrival and completion remain distinct.
- Original screenshots and private message contents are not included in source fixtures.
- Repository changes remain unstaged and uncommitted for user review.

## Implementation questions

Confirm HH2, P/D, 24:00 and #120 meanings; batch selection scope; barcode registration/duplicate rules; manual reorder controls; break behaviour; logoff rejection/cancellation; and the first desired application platform. Obtain job-detail and pickup/delivery screenshots before claiming fidelity for those flows.
