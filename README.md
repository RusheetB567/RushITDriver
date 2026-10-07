# Driver App — cisdriver3 analysis and replacement

Local project prepared for review. No commits or pushes have been made.

## Documents

- [Screenshot catalogue](docs/screens/SCREEN_CATALOGUE.md): observed screens, controls, evidence and open questions.
- [Functional requirements](docs/FUNCTIONAL_REQUIREMENTS.md): requirements derived from the supplied screenshots.
- [Platform blueprint](COURIER_PLATFORM_SPECIFICATION.md): proposed modern platform architecture, distinct from observed existing behaviour.

## Project layout

`docs/` holds analysis and requirements. `apps/` is reserved for application implementation. `packages/` is reserved for shared code. No runtime or framework has been selected or scaffolded yet.

## Evidence handling

Original screenshots remain at their supplied local locations and are excluded from Git. They contain operational and personal information. This repository records UI observations without copying private conversations or real job identifiers into fixtures.

## Git workflow

Git remote `origin` points to https://github.com/RusheetB567/RushITDriver.git. Configuring the remote does not upload files. Review local changes before staging or committing. The user will perform commits; do not automatically stage, commit, push, publish or create a pull request.


## Run the review prototype

Requires Node.js. No dependency installation is required.

```powershell
npm start
```

Open http://localhost:4173. Select the driver or admin demo account. Driver: open a job and advance through acceptance, pickup arrival, pickup, delivery arrival and POD. POD requires recipient name, photo and drawn signature. Admin: create sample jobs, assign drivers and confirm requested driver logoff. Switch accounts to review both surfaces.

`npm run check` checks JavaScript syntax; `npm test` verifies workflow ordering and mandatory POD fields.

This is a dependency-free responsive web prototype, not a production mobile release. State is stored in this browser's localStorage, including uploaded demo evidence. Use synthetic photos only; browser storage is not a secure evidence store. There is no backend identity verification, fleet GPS, camera barcode decoding, RTMS integration, cross-device messaging or server/offline synchronisation. Manual barcode entry records unique identifiers but does not verify real shipment labels. Delivery times remain display strings so `24:00` is preserved. The app uses Google Maps links and optionally loads a Google font.
