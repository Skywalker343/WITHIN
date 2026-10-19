[Uploading README.md…]()
# WITHIN · Mobile VR Experience

A runnable mobile prototype based on the **WITHIN** concept in the portfolio. It carries forward the portfolio's purple spatial visual style, themes of personal values and self-acceptance, and mobile UI flow, while adding navigation, interactive feedback, saved progress, and an immersive experience. The interface supports English and Simplified Chinese, and remembers the selected language on the current device.

## Run Locally

Requires Node.js 18 or later. The project has no npm dependencies.

```powershell
npm run start
```

Open `http://localhost:4173` in a browser. To access the prototype from a phone on the same Wi-Fi network, set `WITHIN_HOST` to `0.0.0.0` in PowerShell before starting the server, then use the computer's IPv4 address from `ipconfig`. Camera, gyroscope, and WebXR features generally require HTTPS; `localhost` is an exception for local testing. The app can be installed as a PWA when hosted over HTTPS.

```powershell
$env:WITHIN_HOST="0.0.0.0"
npm run start
```

## Publish with GitHub Pages

After pushing to the `main` branch, the included GitHub Actions workflow publishes the static site. For the first deployment, open **Settings → Pages** in the repository and select **GitHub Actions** as the publishing source. The public URL follows this format: `https://<GitHub-username>.github.io/WITHIN/`.

## Experience Flow

1. Start from the welcome screen or open the local demo sign-in.
2. From the home screen, open an experience, search the collection, scan an exhibition space, or view the personal value map.
3. Save, share, or start an experience from its detail screen.
4. Explore the immersive space by touch or dragging. Interactions include reflection hotspots, value choices, view reset, ambient sound, gyroscope controls, and WebXR headset mode where supported.
5. Save a reflection after the experience. Journey progress, saved experiences, profile name, and reflections are stored in the current browser.

## Browser and Device Support

- Screens, app state, and the touch-based fallback scene work offline. A-Frame is loaded from a CDN on first use; if it is unavailable, the built-in CSS scene keeps the hotspot interactions usable.
- WebXR, gyroscope permissions, camera access, and QR-code detection depend on browser and device support. Touch and drag controls remain available when these features cannot be used.
- Sign-in is for portfolio demonstration only and does not connect to an account service. Profile data is stored in the current browser on the current device.

## Project Files

- `index.html`, `styles.css`, `app.js`, and `localization.js`: mobile UI, visual design, interactions, and English/Simplified Chinese translations.
- `manifest.json` and `service-worker.js`: PWA metadata and app-shell caching.
- `.github/workflows/deploy-pages.yml`: automatic GitHub Pages deployment.
- `server.mjs`: dependency-free local static server.
- `PORTFOLIO-SUPPLEMENT.md`: mobile design notes for extending the portfolio.
