# Hotel Booking Landing Page - React, Vite, TypeScript, TailwindCSS Frontend Project

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.3-blue?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![React Router](https://img.shields.io/badge/React_Router-6.x-CA4245?logo=react-router&logoColor=white)](https://reactrouter.com/)

A **frontend-only** hotel booking landing page built for learning and instruction. It demonstrates a responsive single-page application (SPA) where users can browse luxury rooms, filter by guest capacity (adults/kids), pick check-in/check-out dates, and view detailed room information—all without a backend. Ideal for understanding React patterns, Context API, routing, form UI, and TailwindCSS in a real-world-style layout.

- **Live Demo:** [https://hotel-booking-ui-2.vercel.app/](https://hotel-booking-ui-2.vercel.app/)

![Screenshot 1](https://github.com/user-attachments/assets/4a059712-7549-4859-9902-0e2e95082f03)
![Screenshot 2](https://github.com/user-attachments/assets/2c5be4d8-651f-4f1e-a502-c4dee3a1a15b)
![Screenshot 3](https://github.com/user-attachments/assets/d9a432d3-b9cd-4e03-9488-f72c17b89a37)
![Screenshot 4](https://github.com/user-attachments/assets/5b3135c2-dd0c-48ba-b241-6b92da251a57)

## Table of Contents

- [Project Summary](#project-summary)
- [Features](#features)
- [Tech Stack & Keywords](#tech-stack--keywords)
- [How to Run / Usage](#how-to-run--usage)
- [Environment Variables & .env](#environment-variables--env)
- [Project Structure](#project-structure)
- [Components Overview](#components-overview)
- [Pages & Routing](#pages--routing)
- [Data, API & Backend](#data-api--backend)
- [Functionality Walkthrough](#functionality-walkthrough)
- [Libraries & Dependencies](#libraries--dependencies)
- [Reusing Components in Other Projects](#reusing-components-in-other-projects)
- [Code Examples](#code-examples)
- [Conclusion](#conclusion)
- [License](#license)

---

## Project Summary

A **React + Vite + TypeScript** hotel booking UI with **TailwindCSS** for styling. The app uses **React Context** for shared state (rooms, guest counts, loading), **React Router** for navigation, **react-datepicker** for dates, **Headless UI** for dropdowns, and **Swiper** for the hero carousel. Room data is static (no backend); the “Check Now” action filters rooms by total guests and simulates loading with a spinner. The codebase is structured for clarity and reuse: typed data, small components, and a single context for booking-related state.

---

## Features

- **Responsive hotel booking frontend** — mobile-ready layout with Tailwind breakpoints
- **Vite-powered** — fast dev server and HMR
- **TailwindCSS** — utility-first styling, custom fonts (Gilda Display, Barlow), accent colors
- **React Context API** — room list, adults/kids, loading, and filter actions in one place
- **Reusable components** — Room cards, BookForm, CheckIn/CheckOut, Adults/Kids dropdowns
- **React Date Picker** — check-in/check-out with calendar popover; only one calendar open at a time
- **Swiper** — hero slider with fade effect and autoplay
- **React Router** — SPA routes: Home, Room Details (`/room/:id`), 404
- **Spinner** — full-screen loading overlay when filtering rooms (3s simulation)
- **Scroll to top** — on every route change
- **Static data** — rooms, slider slides, hotel rules, guest options in `src/data`
- **Room details page** — hero, description, facilities grid, reservation sidebar, hotel rules

---

## Tech Stack & Keywords

**Core:** React, Vite, React Router DOM, TypeScript, TailwindCSS, PostCSS, Autoprefixer

**UI & behavior:** Context API, Hooks, react-datepicker, Swiper, Headless UI (Menu), spinners-react, react-icons

**Concepts:** Responsive design, SPA, component composition, controlled inputs, client-side filtering

**Scope:** Frontend only — no backend or real API; all data is in-repo.

---

## How to Run / Usage

**Prerequisites:** Node.js (v18+ recommended) and npm.

1. **Clone and install**

   ```bash
   git clone <your-repo-url>
   cd hotel-booking-2
   npm install
   ```

2. **Development**

   ```bash
   npm run dev
   ```

   Opens the app at `http://localhost:5173` (or the port Vite prints).

3. **Lint**

   ```bash
   npm run lint
   ```

   Runs ESLint on `.ts` and `.tsx` files with zero warnings.

4. **Production build**

   ```bash
   npm run build
   ```

   Output in `dist/`. TypeScript is compiled with `tsc -b` before the Vite build.

5. **Preview production build**

   ```bash
   npm run preview
   ```

   Serves the `dist` folder locally.

6. **Fonts (optional)**  
   If you add or change self-hosted fonts, run:

   ```bash
   npm run fonts
   ```

   This runs `scripts/download-fonts.cjs` to fetch font files into `public/fonts/`.

---

## Environment Variables & .env

**You do not need any environment variables to run this project.** All configuration is in code (e.g. `vite.config.ts`, `tailwind.config.cjs`), and room/slider data is in `src/data/`.

If you later add a backend or feature flags, you can use Vite’s env support:

- Create `.env` (or `.env.local`) in the project root.
- Define variables with the `VITE_` prefix so they are exposed to the client, e.g. `VITE_API_URL=https://api.example.com`.
- Access them in code as `import.meta.env.VITE_API_URL`.
- Do not commit secrets; `.env.local` and similar are typically in `.gitignore` (this repo already ignores common env files).

Example (optional, not used in current code):

```env
# Optional — not required for current project
# VITE_APP_NAME=Hotel Booking
# VITE_API_URL=https://api.example.com
```

---

## Project Structure

```bash
hotel-booking-2/
├── public/                 # Static assets (favicon, fonts, _redirects)
│   ├── ccp.svg
│   ├── fonts/              # Self-hosted fonts (.woff2)
│   └── _redirects           # SPA fallback for deployment (e.g. Vercel)
├── src/
│   ├── assets/             # Images and SVG components (rooms, slider, logos)
│   │   ├── img/
│   │   └── index.ts        # Image imports and logo exports
│   ├── components/         # Reusable UI
│   │   ├── AdultsDropdown.tsx
│   │   ├── BookForm.tsx
│   │   ├── CheckIn.tsx
│   │   ├── CheckOut.tsx
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── HeroSlider.tsx
│   │   ├── KidsDropdown.tsx
│   │   ├── PageNotFound.tsx
│   │   ├── Room.tsx
│   │   ├── Rooms.tsx
│   │   └── index.ts        # Barrel exports
│   ├── context/
│   │   └── RoomContext.tsx # Room list, adults/kids, loading, handleCheck, reset
│   ├── data/
│   │   ├── constants.ts    # adultsList, kidsList, sliderData, hotelRules
│   │   ├── rooms.ts        # roomData (rooms with facilities, images, price)
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useScrollToTop.ts
│   │   └── index.ts
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── RoomDetails.tsx
│   │   └── index.ts
│   ├── shared/
│   │   └── ScrollToTop.tsx # Uses useScrollToTop; renders nothing
│   ├── style/
│   │   ├── index.css       # Tailwind + global styles
│   │   ├── fonts.css       # @font-face for self-hosted fonts
│   │   └── datepicker.css  # react-datepicker overrides
│   ├── types/              # TypeScript types
│   │   ├── context.ts
│   │   ├── room.ts
│   │   ├── slider.ts
│   │   └── index.ts
│   ├── api/                # Placeholder for future API layer
│   ├── lib/                 # Placeholder for shared utilities
│   ├── App.tsx              # Router, Header, Footer, routes
│   └── main.tsx             # Entry: RoomContext, StrictMode, App
├── scripts/
│   └── download-fonts.cjs  # Fetches fonts into public/fonts
├── index.html               # HTML shell, meta, font preloads
├── vite.config.ts           # Vite config, path alias @ -> src
├── tailwind.config.cjs      # Theme: fonts, colors, screens
├── postcss.config.cjs       # PostCSS (Tailwind, Autoprefixer)
├── tsconfig.json / tsconfig.node.json
└── package.json
```

---

## Components Overview

| Component                         | Purpose                                                                                                                                                                                 |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Header**                        | Fixed nav with logo (white/dark by scroll). Links: Home, Rooms, Restaurant, Spa, Contact. Resets room filter on Home click.                                                             |
| **Footer**                        | Dark footer with logo and copyright.                                                                                                                                                    |
| **HeroSlider**                    | Swiper carousel: fade effect, autoplay, slide titles and CTA. Data from `sliderData`.                                                                                                   |
| **BookForm**                      | Row of CheckIn, CheckOut, AdultsDropdown, KidsDropdown + “Check Now” submit. Submit calls `handleCheck` from context.                                                                   |
| **CheckIn / CheckOut**            | react-datepicker wrappers; calendar icon toggles open/close; only one calendar open at a time (custom event). Optional `popperPlacement` and `popperFullWidth` for Room Details layout. |
| **AdultsDropdown / KidsDropdown** | Headless UI Menu; options from `adultsList` / `kidsList`. Update context `adults` / `kids`.                                                                                             |
| **Rooms**                         | Grid of Room cards. Uses `rooms` and `loading` from context; shows full-screen spinner when `loading`.                                                                                  |
| **Room**                          | Single room card: image, size/maxPerson, name, description snippet, price, “Book now” link to `/room/:id`.                                                                              |
| **RoomDetails**                   | Page for one room: hero, description, large image, facilities grid, “Your Reservation” sidebar (dates + guests), hotel rules. Resolves room by `useParams().id` from context `rooms`.   |
| **PageNotFound**                  | 404 fallback for unknown routes.                                                                                                                                                        |
| **ScrollToTop**                   | Renders nothing; runs `useScrollToTop()` to scroll window to top on route change. Rendered on Home and RoomDetails.                                                                     |

---

## Pages & Routing

Routing is defined in `App.tsx` with `react-router-dom` (BrowserRouter, Routes, Route).

| Route       | Page         | Description                                                         |
| ----------- | ------------ | ------------------------------------------------------------------- |
| `/`         | Home         | HeroSlider, BookForm overlay, Rooms grid.                           |
| `/room/:id` | RoomDetails  | Room by `id` from context; hero, content, reservation block, rules. |
| `*`         | PageNotFound | Catch-all 404.                                                      |

Route future flags used: `v7_startTransition`, `v7_relativeSplatPath` for React Router v7-ready behavior.

---

## Data, API & Backend

- **No backend.** All data is in `src/data/`.
- **rooms.ts** — `roomData`: array of `Room` (id, name, description, facilities, size, maxPerson, price, image, imageLg). Facilities use react-icons (e.g. FaWifi, FaCoffee).
- **constants.ts** — `adultsList`, `kidsList` (guest options), `sliderData` (hero slides: id, title, bg, btnNext), `hotelRules` (check-in/out, no smoking, no pet).
- **api/index.ts** — Placeholder for future API layer (e.g. `fetchRooms()`). Not used yet.
- **Filtering:** “Check Now” in BookForm calls `handleCheck` in RoomContext, which filters `roomData` by `total <= room.maxPerson` and sets the result to `rooms` after a 3s delay (loading simulation).

---

## Functionality Walkthrough

### Home (`/`)

1. **Hero:** Swiper shows slides from `sliderData`; fade and autoplay.
2. **BookForm:** User picks check-in, check-out (datepickers), adults, kids. “Check Now” runs `handleCheck`: sets `loading` true, then after 3s sets `rooms` to rooms that fit total guests.
3. **Rooms:** Grid of Room cards from `rooms`. If `loading`, full-screen spinner. Each card links to `/room/:id`.

### Room Details (`/room/:id`)

1. Room is found with `rooms.find((r) => r.id === Number(id))`. If not found, “Room not found.” is shown.
2. **Content:** Name, description, large image, facilities grid (icon + name).
3. **Your Reservation:** CheckIn, CheckOut, Adults, Kids (same components as Home but with `popperFullWidth` and `popperPlacement="bottom-end"`). “book now for $price” button (no backend action).
4. **Hotel Rules:** List from `hotelRules` with check icons.

### Datepicker behavior

- CheckIn and CheckOut each manage open state; clicking outside or selecting a date closes the calendar.
- Opening one calendar dispatches a custom `datepicker-open` event; the other listens and closes so only one is open at a time.
- Calendar icon toggles open/close; chevrons in dropdowns rotate 180° when open (CSS + Headless UI state).

---

## Libraries & Dependencies

Short description of main packages and how they’re used:

- **react** — UI components and hooks.
- **react-dom** — React renderer for the DOM.
- **react-router-dom** — Client-side routing (BrowserRouter, Routes, Route, Link, useParams, useLocation).
- **react-datepicker** — Date input and calendar popover; styled via `src/style/datepicker.css`.
- **@headlessui/react** — Menu for Adults/Kids dropdowns (accessible, unstyled).
- **react-icons** — Icons (BsCalendar, BsChevronDown, FaWifi, FaCheck, etc.).
- **swiper** — Hero slider (Swiper, SwiperSlide, EffectFade, Autoplay).
- **spinners-react** — SpinnerDotted for loading overlay.
- **vite** — Build tool and dev server; path alias `@` → `src`.
- **@vitejs/plugin-react** — React Fast Refresh and JSX.
- **vite-plugin-svgr** — Import SVGs as React components (e.g. logos).
- **tailwindcss** — Utility CSS; theme in `tailwind.config.cjs` (fonts, colors, screens).
- **typescript** — Typing; types in `src/types/`.
- **eslint** + **typescript-eslint** + **eslint-plugin-react-hooks** + **eslint-plugin-react-refresh** — Linting.

Example: using context in a component:

```tsx
import { useRoomContext } from "../context/RoomContext";

function MyComponent() {
  const { rooms, adults, setAdults, handleCheck } = useRoomContext();
  // ...
}
```

---

## Reusing Components in Other Projects

- **CheckIn / CheckOut:** Copy component + `datepicker.css` (and base react-datepicker CSS). They accept `popperPlacement` and `popperFullWidth`. Replace with your state/API if you need to sync dates to a backend.
- **AdultsDropdown / KidsDropdown:** Depend on `useRoomContext()` for value and setter. To reuse, either wrap your app in RoomContext or refactor to accept `value`/`onChange` (and options list) as props.
- **Room / Rooms:** Pass `room` (or list) and your routing. Types are in `src/types/room.ts`; replace image/price fields to match your data.
- **HeroSlider:** Swap `sliderData` for your own array of `{ id, title, bg, btnNext }` and point `bg` to your images.
- **ScrollToTop:** Use anywhere inside the router; it only runs `useScrollToTop()` and returns null. Copy `useScrollToTop` hook if you use a different router.
- **Header / Footer:** Replace logo and links with your branding and routes.

---

## Code Examples

**Using RoomContext (e.g. in BookForm):**

```tsx
import { useRoomContext } from "../context/RoomContext";

export default function BookForm() {
  const { handleCheck } = useRoomContext();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleCheck(e);
      }}
    >
      {/* CheckIn, CheckOut, dropdowns, submit button */}
    </form>
  );
}
```

**Room type (from `src/types/room.ts`):**

```ts
export interface Room {
  id: number;
  name: string;
  description: string;
  facilities: Facility[];
  size: number;
  maxPerson: number;
  price: number;
  image: string;
  imageLg: string;
}
```

**Route definition (from `App.tsx`):**

```tsx
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/room/:id" element={<RoomDetails />} />
  <Route path="*" element={<PageNotFound />} />
</Routes>
```

---

## Conclusion

This repo is a **teaching-focused** hotel booking UI: React + Vite + TypeScript + Tailwind, with Context for state, React Router for SPA navigation, and static data for rooms and content. It shows patterns like shared state, reusable form components, date pickers, dropdowns, and responsive layout. No backend or environment variables are required; you can extend it with an API layer in `src/api/` and optional `.env` when needed.

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT). Feel free to use, modify, and distribute the code as per the terms of the license.

## Happy Coding! 🎉

This is an **open-source project** - feel free to use, enhance, and extend this project further!

If you have any questions or want to share your work, reach out via GitHub or my portfolio at [https://www.arnobmahmud.com](https://www.arnobmahmud.com).

**Enjoy building and learning!** 🚀

Thank you! 😊
