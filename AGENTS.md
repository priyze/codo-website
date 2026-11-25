# Repository Guidelines

These instructions apply to AI coding agents working in this repository.

## Project overview

Codo is a companion website for a programmable ESP32 desk buddy. It connects Codeforces and GitHub activity to a progression system and an accessory shop for a 128×64 monochrome OLED display.

## Project architecture

- **OLED renderer (`src/lib/oled-engine.ts` and `src/lib/accessories.ts`):** Faces and accessories render to a 1-bit 128×64 framebuffer. Keep the browser preview faithful to the physical 0.96-inch SSD1306 display and the drawing primitives supported by the ESP32 firmware.
- **External API sync (`src/lib/integrations.functions.ts`):** Codeforces and GitHub public API requests run server-side through TanStack Start server functions. Preserve the existing normalization of distinct solves, activity data, and CodoCoins calculations in `src/lib/scoring.ts`.
- **Browser persistence (`src/lib/buddy-store.ts`):** Onboarding state, names, linked handles, owned/equipped accessories, and spent CodoCoins are stored in `localStorage`. Access browser storage only on the client (for example, after mount); do not read it synchronously during server-side rendering.

## Development workflow

- Install dependencies with `npm install`.
- Start the development server with `npm run dev`.
- Create a production build with `npm run build`.
- Run the test suite with `npm test`.
- Run linting with `npm run lint`.

## Change guidelines

- Preserve the existing TanStack Start routing, server/client boundaries, and deployment configuration unless the task explicitly requires changing them.
- Keep secrets and private credentials out of source control and browser bundles. Use the deployment environment's secret-management facilities for server-side credentials.
- Do not commit generated build output, dependency directories, or local environment files.
- When changing scoring, progression, or accessory pricing, check the related UI and tests so the displayed values remain consistent.
- When changing OLED artwork, verify that it fits within the 128×64 monochrome display and remains compatible with the companion firmware.
- Prefer focused changes that preserve existing behavior. Run the relevant checks before considering a change complete.
