# Architecture/product decisions and change log

| ID | Context / options | Decision and tradeoff | Owner / status | Revisit when |
| --- | --- | --- | --- | --- |
| ADR01 | Prototype vs commercial domain | Reuse tested foundation; retain disposable prototype separately. Do not certify a prototype as an MVP | Engineering / adopted development approach | Production acceptance criteria change |
| ADR02 | Microservices vs modular monolith | Modular monolith and transactions first; service split only for measured ownership/load | Architecture / proposed production baseline | Independent scale/availability need |
| ADR03 | SQLite local vs PostgreSQL production | SQLite is local adapter only; PostgreSQL migration/runtime/RLS tests required before commercial scale claims | Database / open implementation | Production environment work |
| ADR04 | Fixed roles vs permissions | Move to permission catalogue plus organisation/branch/account/assignment scope | Security / required backlog | B02 design review |
| ADR05 | Immediate billing vs operational MVP | Defer automated pricing/accounting unless selected pilot requires it; obtain finance decision | PO/finance / pending | G0 scope review |
| ADR06 | Route optimisation vs navigation | External navigation initially; later constrained advisory recommendations | PO/routing / proposed | Region/cost/capacity discovery |
| ADR07 | MFA/social/biometric visual reference vs actual services | Reference informs styling; do not display working auth flows without configured verification/provider services | Security/UX / adopted UI boundary | Provider/native auth milestone |
| CR01 | Initial reference name conflicted with user brand | User clarified **Rush IT**; use that name in interface; preserve Git remote/folder identity | User / confirmed | User changes branding |
| CR02 | User provided local sign-in credentials | Provision authorised local administrator with salted hash only; never write password into app source/docs/tests | User/backend / authorised; local sign-in and sign-out verified 8 October 2026 | Production identity migration |

No entry is budget approval, production authorisation or a claim of legal compliance.
