# Rush IT project baseline — Phase 0

7 October 2026 · DRAFT baseline prepared from the user's project-management brief, compliance brief, screenshot evidence and code review. Existing local code remains a PARTIAL foundation. This index distinguishes drafted plans from implemented/tested services and accepted production deliverables.

Read first: [Project Charter](PROJECT_CHARTER.md), [scope/PRD](SCOPE_AND_PRD.md), [codebase review](CODEBASE_REVIEW.md).

## Initiation deliverables

| Deliverable | Location | Status |
| --- | --- | --- |
| Charter, executive vision/objectives | PROJECT_CHARTER.md | DONE draft; review pending |
| Scope, assumptions/constraints, MVP boundary | SCOPE_AND_PRD.md; RAID_REGISTER.md | DONE draft; pilot decisions pending |
| Stakeholder and RACI matrices | GOVERNANCE.md | DONE draft; human roles unappointed |
| RAID and risk mitigation | RAID_REGISTER.md | DONE initial register; maintained each gate |
| Capability/process maps and journeys | CAPABILITIES_AND_PROCESSES.md | DONE hypothesis; operator validation pending |
| Requirements catalogue / PRD / personas | REQUIREMENTS_CATALOGUE.md; SCOPE_AND_PRD.md | PARTIAL epic baseline; detailed stories before sprint |
| Lifecycle/exceptions/feature/screens/information architecture | CAPABILITIES_AND_PROCESSES.md; ../PRODUCT_ARCHITECTURE.md | PARTIAL target design; multi-leg/exception detail pending |
| Context/container architecture and ERD | CAPABILITIES_AND_PROCESSES.md | DONE target diagrams; not all containers implemented |
| Backend/mobile/web/database/state/API/live/GPS/offline/POD/file/auth/RBAC/threat design | ../PRODUCT_ARCHITECTURE.md; ../POSTGRES_SCHEMA.sql | PARTIAL baseline; typed contracts/migration/device/provider decisions pending |
| Integration/notification architecture | ../PRODUCT_ARCHITECTURE.md; DELIVERY_ROADMAP.md | PARTIAL adapter/outbox design; contracts/provider plans pending |
| Infrastructure/CI/observability/test/UAT strategy | DELIVERY_ROADMAP.md | PARTIAL proposed strategy; no deployed pipeline/monitoring |
| Product backlog, sprint/release roadmap | DELIVERY_ROADMAP.md | DONE draft dependency order; dates/capacity uncommitted |
| Production checklist/post-launch roadmap | DELIVERY_ROADMAP.md; ../compliance/COMPLIANCE_BASELINE.md | PARTIAL checklists; evidence/approvals not present |
| Design reference and brand decisions | DECISIONS.md | Rush IT confirmed; reference styling adopted |

## Review phase report (A–L)

A Objective: review the code/brief and establish a manageable Phase 0 baseline. B Business reason: prevent a visually complete prototype from being mistaken for an operable courier release. C Architecture: retain modular domain foundation and document migration/security/offline/evidence gaps. D Files: this index plus charter/governance/scope/maps/RAID/catalogue/review/roadmap/decisions. E Database changes: none for this documentation phase. F APIs: none for this phase. G Security: no production approval; privacy, provider and device gates remain open. H Implementation: the documents are the actual deliverables; later UI/account work is recorded separately. I Testing: existing bounded foundation tests are evidence, not full UAT. J Verification: read gaps/status, follow requirement IDs to backlog/gates and review pilot assumptions. K Git suggestion: branch `codex/project-baseline`, commit `docs: establish courier project governance and delivery baseline`, PR description `Establish the project charter, scope, ownership, risks and requirements traceability; document current foundation gaps and gated delivery roadmap.` L Status: PARTIAL project initiation; drafting complete, product owner/operational validation pending. No Git action has been executed.

## Next controlled implementation

Complete foundation migration/permission/contracts before the next evidence/POD schema slice; then deliver verified package pickup → accepted POD, native/offline recovery and live map/customer milestones. The user can review local artefacts without another generic permission checkpoint. Provider resources, legal/pilot decisions and production release require their specific review when applicable.
