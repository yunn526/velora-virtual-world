# VELORA — Virtual Exhibition World

> **A World Beyond Walls.**

VELORA is a 3D virtual exhibition world built as a Progressive Web App (PWA). Visitors can explore a five-floor gallery, with three independent exhibition zones on every floor.

## Current Phase 1

- Five-floor 3D exhibition building
- Three exhibition zones per floor: A / West Wing, B / North Wing, C / East Wing
- Central public hall, reception/lounge, artwork walls, sculptures, benches and plants
- Floor and gallery quick-navigation panel
- Desktop WASD / arrow-key movement, mouse look and Shift sprint
- Firebase Google Authentication integration point
- GitHub Pages deployment via GitHub Actions
- PWA manifest and service worker foundation

**Movement tuning is intentionally preserved** in this version because the current WASD feel has been approved. Do not change `ExplorerMovement` unless a movement-specific issue is reported.

## Floor Plan

| Floor | Main use | Zones |
|---|---|---|
| 5F | Featured Exhibition | Curated collection / annual theme / special curation |
| 4F | Community Gallery III | User exhibition A / B / C |
| 3F | Community Gallery II | User exhibition A / B / C |
| 2F | Community Gallery I | User exhibition A / B / C |
| 1F | Main Lobby | Welcome gallery / emerging creators / themed works |

Floors 2F–4F are planned as rotating user exhibition areas. Daily or weekly rotation and user-uploaded exhibitions will be implemented in Phase 2.

## Run locally

1. Install Node.js LTS.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and fill in the Firebase Web App values (see **Firebase setup** below).
4. Run `npm run dev`.

## Firebase Google Authentication setup

1. Create a Firebase project at the Firebase Console.
2. Add a **Web App** to the project and copy its Firebase config.
3. In **Authentication → Sign-in method**, enable **Google**.
4. In **Authentication → Settings → Authorized domains**, add `yunn526.github.io` and your local development host if needed.
5. For local development, put the Web App values into `.env.local` using the names in `.env.example`.
6. For GitHub Pages, open **Repository → Settings → Secrets and variables → Actions → Variables** and add these repository variables:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
7. Push a commit to `main` to trigger a fresh deployment.

Firebase Web App configuration is intended to be present in the client. Protect the project with Firebase Authentication settings and, when Firestore/Storage are added in later phases, restrictive Security Rules. Never place service-account private keys in frontend variables.

Until the Firebase values are configured and deployed, the Google login button will explain that setup is pending; the **Preview mode** remains available for testing the 3D gallery.

## GitHub Pages deployment

This repository is configured for `https://yunn526.github.io/velora-virtual-world/`.

- GitHub → Settings → Pages → Source must be **GitHub Actions**.
- Workflow: `.github/workflows/deploy.yml`
- Vite base path: `/velora-virtual-world/`

The workflow builds the Vite app and deploys only the generated `dist/` directory. Do not publish the repository root directly.

## Planned phases

- **Phase 1:** 3D world, five floors, three zones per floor, movement, PWA foundation and Google authentication.
- **Phase 2:** User exhibitions, artwork uploads, exhibition editing, expiry and admin scheduling.
- **Phase 3:** Daily check-in, seven-day new-user rewards, gems and leaderboards.
- **Phase 4:** Furniture shop and customizable exhibition spaces.
- **Phase 5:** Co-curation, invitations and official exhibitions.
- **Phase 6:** FREE / PRO membership and subscription management. PRO access is initially granted by the administrator; payments are not part of the initial build.

## Project structure

```text
velora-virtual-world/
├── .github/workflows/deploy.yml
├── public/
│   ├── favicon.svg
│   ├── manifest.webmanifest
│   └── sw.js
├── src/
│   ├── App.jsx
│   ├── World.jsx
│   ├── firebase.js
│   ├── main.jsx
│   └── style.css
├── .env.example
├── .gitignore
├── index.html
├── package.json
└── vite.config.js
```
