# Privacy and information governance addendum — Rush IT 0.3

This supplements the draft compliance baseline; it is not production approval.

| New data | Purpose | Local access/storage |
| --- | --- | --- |
| AWB/MAWB/HAWB, shipper/consignee, route and flight references | Connect freight documentation to local jobs | Organisation-scoped SQLite metadata; assigned-driver access only for linked cargo |
| Original PDF/JPG/PNG freight documents | Recognition, human review and source traceability | AES-256-GCM encrypted bytes; authenticated/scoped download; local ignored encryption key |
| Recognised text, field candidates, source snippets and review flags | Correct structured cargo before dispatch | Scoped SQLite records; text and metadata are not field-encrypted |
| Package barcodes, dimensions and scan events | Cargo matching, scan completeness and retry history | Scoped relational data; immutable scan records |
| Recipient name, signature strokes, delivery photograph, optional GPS, notes and policy snapshot | Delivery evidence tied to recorded job completion | Signature/photo/GPS payload encrypted; recipient/time/notes metadata scoped but not field-encrypted |
| Base/driver messages and read timestamps | Operational communication | Sender/recipient-scoped records; no external messaging transmission |
| Five safety declaration booleans and shift closure requests | Structured shift acknowledgement and handover | Audited scoped records; no clinical details requested |

OCR runs locally using bundled English language data. Documents are not transmitted to a hosted model. Quality indicators are heuristic and require human verification. Uploaded text never becomes executable instructions. No automated retention/deletion policy is claimed.

Outstanding release controls include malware screening and deeper image/PDF validation, managed key custody/rotation, independently protected backups and tested key/database restoration, approved notices/retention schedules, representative document accuracy/accessibility review and physical-device camera/signature acceptance. Camera is activated only by the user; frames remain local and tracks are stopped on close. GPS remains opt-in per event except where a selected POD policy requires a sample.

Use synthetic data during review. The production release gate in COMPLIANCE_BASELINE.md remains open.
