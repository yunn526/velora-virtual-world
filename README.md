# VELORA — Virtual Exhibition World

> **A World Beyond Walls.**

VELORA is a 3D virtual exhibition world built as a Progressive Web App (PWA). Visitors can explore a five-floor gallery, with three independent exhibition zones on every floor.

## Current Phase 1

- Five-floor 3D exhibition building
- Three exhibition zones per floor: A / West Wing, B / North Wing, C / East Wing
- Central public hall, three independent exhibition zones per floor
- A clearer U-shaped switchback staircase with a proper intermediate landing and handrails
- Refined seating, plants, reception placement and clearer central walking route
- Floor and gallery quick-navigation panel
- Desktop WASD / arrow-key movement, mouse look and Shift sprint
- Firebase Google Authentication with readable error codes and mobile redirect fallback
- Phase 2 exhibition draft manager backed by Firestore
- GitHub Pages deployment via GitHub Actions
- PWA manifest and service worker foundation

**Movement tuning is intentionally preserved** in this version because the current WASD feel has been approved. The movement controller itself was not modified.

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

Firebase Web App configuration is intended to be present in the client. The current project includes Firestore access for private exhibition drafts. Apply the included `firestore.rules` in Firebase Console → Firestore Database → Rules before using the exhibition studio. Never place service-account private keys in frontend variables.

Until the Firebase values are configured and deployed, the Google login button will explain that setup is pending; the **Preview mode** remains available for testing the 3D gallery.

## Phase 2 — Exhibition drafts (first milestone)

The current Phase 2 milestone lets a signed-in user create, edit, list and delete private exhibition drafts. Each draft stores its title, introduction, category and preferred floor/zone in Firestore. Drafts are private to their owner and are not automatically published or scheduled.

1. In Firebase Console, create a **Cloud Firestore** database.
2. Choose a suitable region and start with the locked/production rules option.
3. Open the Firestore **Rules** tab and paste the contents of `firestore.rules`, then publish.
4. Deploy the updated website. Sign in with Google and open **我的展覽**.

Image upload, public exhibition display, administrator scheduling and automatic floor rotation are later Phase 2 steps. Cloud Storage for newly created Firebase projects currently requires the Blaze billing plan; do not enable billing just for testing. Review any billing change with a parent or guardian first. This release does not upload image files.

## GitHub Pages deployment

This repository is configured for `https://yunn526.github.io/velora-virtual-world/`.

- GitHub → Settings → Pages → Source must be **GitHub Actions**.
- Workflow: `.github/workflows/deploy.yml`
- Vite base path: `/velora-virtual-world/`

The workflow builds the Vite app and deploys only the generated `dist/` directory. Do not publish the repository root directly.

## Planned phases

- **Phase 1:** 3D world, five floors, three zones per floor, movement, PWA foundation and Google authentication.
- **Phase 2:** Exhibition drafts are included in this release; image uploads, public display, expiry and admin scheduling remain to be implemented.
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
│   ├── ExhibitionStudio.jsx
│   ├── World.jsx
│   ├── firebase.js
│   ├── main.jsx
│   └── style.css
├── .env.example
├── firestore.rules
├── .gitignore
├── index.html
├── package.json
└── vite.config.js
```


## Phase 2 progress (initial)

- Exhibition Studio: create, edit, and delete Firestore exhibition drafts.
- Draft fields: title, description, category, preferred floor, preferred zone.
- Image upload and in-world artwork placement are not included yet.
- Auth popup fallback: redirect flow is attempted for popup-blocking / unsupported browser errors.
- Lobby stair switchback moved into the central circulation area to avoid the reception seating.

If Google sign-in still fails, the welcome screen displays the Firebase error code and detail. Use that code to troubleshoot the exact configuration rather than changing settings blindly.
