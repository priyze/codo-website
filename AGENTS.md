<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project Architecture Rules

- **128×64 OLED Renderer (`src/lib/oled-engine.ts` & `src/lib/accessories.ts`)**: All desk buddy faces and accessories render to a 1-bit 128×64 monochrome framebuffer using only the 4 `Canvas` primitives from the user's ESP32 `face.h` (`fillRoundRect`, `fillTriangle`, `drawLine`, `clear`) so web previews stay 1:1 faithful to the physical 0.96" SSD1306 hardware.
- **External API Sync (`src/lib/integrations.functions.ts`)**: Codeforces and GitHub public APIs are fetched server-side via TanStack Start `createServerFn` to avoid browser CORS limits and normalize distinct solves, heatmaps, and CodoCoins calculation (`src/lib/scoring.ts`).
- **Browser Persistence (`src/lib/buddy-store.ts`)**: Onboarding state, names, linked handles, owned/equipped accessories, and spent CodoCoins live in `localStorage` hydrated inside `useEffect` (never read synchronously during SSR render).
