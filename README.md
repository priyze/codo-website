# Codo — Desk Buddy Accessory Shop

Codo is a companion website for a programmable ESP32 desk buddy. It lets users connect their Codeforces and GitHub profiles, track coding activity, earn CodoCoins, and unlock OLED-compatible accessories for their buddy.

## Features

- Personalise the user and desk buddy profiles.
- Connect Codeforces and GitHub handles to synchronise coding activity.
- View coding statistics, activity history, and profile information.
- Earn CodoCoins and progress through levels.
- Browse, preview, purchase, and equip eye and mouth accessories designed for a 128×64 OLED display.

## Tech stack

- React
- TypeScript
- TanStack Start and TanStack Router
- Vite
- Tailwind CSS
- Radix UI and shadcn-style components
- Recharts
- Lucide icons

## Getting started

### Requirements

- Node.js (use a current LTS release)
- npm

### Install dependencies

```sh
npm install
```

### Start the development server

```sh
npm run dev
```

### Build for production

```sh
npm run build
```

### Run linting and tests

```sh
npm run lint
npm test
```

## Project structure

- `src/routes/` — application routes and page metadata
- `src/components/` — reusable interface components
- `src/lib/` — scoring, profile integrations, accessories, and application state
- `public/` — static assets

## Notes

Codo is designed to work alongside the companion ESP32 firmware. The website provides the profile, activity, progression, and accessory-shop experience; hardware communication and firmware deployment are handled separately.

## License

Add the project's chosen license here before distributing the source.
