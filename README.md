Interactive Wall Calendar (Frontend Challenge)

A React + JavaScript component inspired by a physical wall calendar layout, with a visual hero section, interactive date-range selection, and an integrated notes area.

 What I Built

- Wall-calendar aesthetic with:
  - Hanger + spiral strip details
  - Large hero image that anchors each month
  - Segmented card layout for calendar grid and notes
- Day range selector:
  - Click once for start date
  - Click again for end date
  - Clear visual states for start, end, and in-between days
  - Selection summary with duration in days
- Notes system:
  - Month-level notes
  - Date-range notes
  - Toggle between note scopes (Month / Range)
- Persistence:
  - All notes and selected range persist in localStorage
- Responsive behavior:
  - Desktop: 3-panel layout (hero, calendar, notes)
  - Mobile: stacked layout with touch-friendly day targets and controls

## Stack

- Vite
- React
- CSS (custom, no UI framework)

## Run Locally


npm install
npm run dev

## Files of Interest

- `src/App.jsx`: calendar logic, range selection, notes, persistence
- `src/App.css`: component styling and responsive layout
- `src/style.css`: global theme and page background
- `src/main.jsx`: React entrypoint

## Demo Video Checklist

When creating your required video demo (Loom/YouTube/screen recording), show:

1. Selecting a date range (start + end + highlighted middle days)
2. Writing a month note and a range note
3. Reloading to prove local persistence
4. Desktop view to mobile responsive transition


