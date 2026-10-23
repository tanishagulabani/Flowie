# 🌸 Flowie — Women's Health Companion (v1)

A simple, private, mobile-first Progressive Web App for women's health tracking. **No backend. No accounts. No tracking.** All data lives on your device.

---

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
# → Open http://localhost:5173

# Build for production
npm run build
```

---

## Features

### 1. 🗓 Cycle Tracker
- Interactive monthly calendar — tap any day to mark it as a period day
- Tap a start date again to remove it; tap an adjacent day to extend the period
- **Color coding:**
  - Solid pink — logged period days
  - Dashed pink — predicted next period
  - Soft lavender — predicted fertile window
  - Amber — today
- Summary cards: "Next period in X days" and "Day N of your cycle"
- Cycle history list showing all logged periods

### 2. Daily Check-in
- Tap-based form completable in under 15 seconds
- **Mood** — 5 emoji options (Rad / Good / Meh / Bad / Awful)
- **Cramps** — None / Mild / Moderate / Severe
- **Energy** — Low / Medium / High
- **Sleep** — range slider from 0–12 hours (0.5h steps)
- Optional free-text notes
- One entry per day, fully editable
- **Streak counter** showing consecutive days with a check-in

### 3. Simple Insights
Three Recharts charts + plain-language insight cards:
- **Cycle length over time** — line chart of days between period starts
- **Mood trend** — line chart of mood scores over the last 30 days
- **Cramp severity by cycle day** — bar chart of average cramp score per day of cycle
- Auto-generated insight cards (e.g. "You often report low energy before your period")
- Friendly empty states when data is insufficient

### 4. Reminders
- Four reminder types: Period coming soon, Daily check-in, Supplement/pill, Water
- Toggle on/off + time picker for each
- Uses the **Notifications API** when permission is granted
- Falls back to in-app display when permission is not available
- Accessible from Settings

### 5. Find Supplies Nearby
- Asks for location permission only when the user taps the button
- Privacy note shown before requesting permission
- **Manual fallback**: enter area name, city, or pincode (geocoded via Nominatim/OpenStreetMap)
- Filter chips: Pads, Tampons, Cups, Pain Relief, Pregnancy Tests
- Leaflet map (OpenStreetMap tiles) with pins for each result
- Results list sorted by distance with name, type, distance, Directions (Google Maps), and Call button
- Results from **Overpass API** within 3 km — no API key required

---

## Prediction Algorithm

The prediction engine lives in `src/utils/cyclePredictor.ts`.

### How it works

1. **Sort** all CycleEntry records by startDate ascending.
2. **Compute cycle lengths** — for each consecutive pair of start dates, calculate the difference in days. Values outside 10–60 days are excluded as outliers.
3. **Average cycle length** — arithmetic mean of all valid cycle lengths. Falls back to **28 days** until there are at least 2 complete cycles.
4. **Average period length** — mean of (endDate − startDate + 1) for cycles where an endDate has been logged. Falls back to **5 days**.
5. **Next period start** = lastPeriodStart + averageCycleLength
6. **Fertile window** — ovulation is estimated as nextPeriodStart − 14 days. Fertile window spans ovulation − 5 to ovulation + 1 (6 days total).
7. **Confidence level**: low (<2 cycles), medium (2–4 cycles), high (5+ cycles).

> Flowie is a convenience tracker, not a medical device. Predictions are statistical estimates and should not be used for contraception or medical decisions.

---

## Tech Stack

| Layer | Library |
|---|---|
| Framework | React 18 + TypeScript |
| Build tool | Vite 8 |
| Styling | Tailwind CSS v4 + CSS custom properties |
| Routing | React Router v6 |
| Charts | Recharts |
| Map | Leaflet + react-leaflet |
| Map tiles | OpenStreetMap (free, no key) |
| Place search | Overpass API (free, no key) |
| Geocoding | Nominatim (free) |
| Icons | Lucide React |
| Storage | localStorage (typed wrapper in utils/storage.ts) |

---

## Folder Structure

```
src/
├── types/          # CycleEntry, CheckIn, Reminder, NearbyPlace
├── hooks/          # useCycle, useCheckIn, useReminders, useNearby, useTheme, useAppLock
├── utils/          # cyclePredictor, dateHelpers, storage, distance, overpassQuery, geocode, demoData
├── context/        # AppContext — single provider for all global state
├── components/
│   └── layout/     # BottomNav, PageWrapper
└── pages/          # Home, CycleTracker, CheckIn, Insights, Reminders, Nearby, Settings,
                    # Onboarding, AppLock
```

---

## Privacy

- **Zero backend** — static bundle, no server calls except map tiles and Overpass.
- **localStorage only** — all data stored under flowie_* keys in the browser.
- **Location** — requested only on Nearby page tap, never stored.
- **Notifications** — requested only when enabling a reminder.
- **Export** — Settings → "Export my data" downloads JSON.
- **Delete** — Settings → "Delete all my data" wipes all keys.
- **PIN lock** — optional 4-digit PIN, device-only.

---

## Demo Data

Settings → Demo data toggle fills 3 months of realistic sample data:
- 4 past cycles (26–30 day lengths, 4–6 day periods)
- ~48 daily check-ins with random moods, cramps, energy, sleep
- Default reminders

Toggle off to clear demo data and start fresh.

---

## PWA Install

On mobile: Browser menu → "Add to Home Screen". The app opens in standalone mode.
