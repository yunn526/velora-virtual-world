# Musea — Phase 1 starter

## Included
- React + Vite
- Three.js via React Three Fiber
- Five-floor gallery concept and floor selector
- Desktop pointer-lock movement (WASD, mouse, Shift)
- Google sign-in placeholder via Firebase Authentication
- PWA manifest + service worker shell

## Run locally
1. Install Node.js (LTS).
2. Extract this project.
3. In the project folder run:
   ```bash
   npm install
   npm run dev
   ```
4. Open the local Vite URL.

## Enable Google login
1. Create a Firebase project.
2. Add a Web App and copy its Firebase config.
3. Replace placeholder values in `src/firebase.js`.
4. In Firebase Console, Authentication → Sign-in method, enable Google.
5. Add your development and deployment domains to Authentication → Settings → Authorized domains.

Until Firebase is configured, use **先探索展示模式** to preview the gallery UI.

## Phase 1 next tasks
- Replace placeholder gallery geometry with designed modular floors, stair/elevator connection and lobby.
- Add real vertical movement between floors (currently floor selector changes gallery level).
- Add mobile touch joystick and touch-look.
- Optimize assets, loading and low-end device settings.
- Add a privacy-conscious account/profile page and production authentication flow.

## Notes
This is an early scaffold, not a production-ready app. Floor switching is currently a prototype teleport. The gallery geometry is intentionally simple to keep the initial build lightweight.

## GitHub Pages Deployment

This repository uses GitHub Actions to build and deploy Vite to Pages.

1. Push the project files to the `main` branch.
2. In GitHub, open **Settings → Pages**.
3. Set **Build and deployment → Source** to **GitHub Actions**.
4. Push a new commit or run the workflow manually from **Actions**.
5. After the workflow succeeds, open:
   `https://yunn526.github.io/velora-virtual-world/`

The Vite `base` path is configured for this repository's Pages URL.

## Important: GitHub Pages must deploy the Vite build

Do **not** publish the repository root directly. The root `index.html` is a Vite source file and references `src/main.jsx`. GitHub Pages must publish the generated `dist/` folder using the workflow in `.github/workflows/deploy.yml`.

If Actions only shows the default **pages build and deployment** workflow, verify that `.github/workflows/deploy.yml` exists on the `main` branch and that the custom workflow has run successfully.
