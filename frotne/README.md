# SurplusLink — Frontend Client 💻

Interactive React.js Single Page Application (SPA) designed as a real-time **Food Rescue Operations Command Center**.

---

## 🛠 Tech Stack

- **Framework**: React.js 18 (Vite)
- **Language**: Pure JavaScript (`.jsx` / `.js`)
- **Styling**: Tailwind CSS (Command Center dark palette)
- **Icons**: Lucide React
- **Visualizations**: Recharts (Dynamic Bar Chart)

---

## 📂 Frontend Directory Structure

```
frontend/
├── src/
│   ├── components/            # Reusable UI Components
│   │   ├── Navbar.jsx         # Top navigation: Persona switcher & Simulated Clock control
│   │   ├── MissionCard.jsx    # Live mission rescue card with progress bar & actions
│   │   ├── CountdownTimer.jsx # Live countdown driven by backend simulated clock
│   │   ├── RescueProgress.jsx # Visual progress bar (collected / total * 100)
│   │   ├── RescueNowQueue.jsx # Top urgent queue sorted by closest pickup deadline
│   │   ├── DonationModal.jsx  # Modal form for Donors to post surplus food
│   │   └── ClaimModal.jsx     # Modal form for Volunteers with 7-rule validation feedback
│   │
│   ├── pages/                 # Main Views / Tabs
│   │   ├── LiveCommandCenter.jsx   # Visual centerpiece: Rescue Now queue + all missions
│   │   ├── DonorWorkspace.jsx      # Donor view: post food, manage donations & claims
│   │   ├── VolunteerWorkspace.jsx  # Volunteer view: available food, active claims, collect
│   │   └── ImpactDashboard.jsx     # Mass conservation audit & visual Recharts breakdown
│   │
│   ├── api.js                 # API client (clean fetch calls to /api/...)
│   ├── App.jsx                # Root component managing active persona, tabs & data
│   ├── index.css              # Tailwind CSS styles & custom scrollbars
│   └── main.jsx               # React DOM entry point
│
├── index.html                 # App shell with title and metadata
├── vite.config.js             # Vite setup with proxy (/api -> http://localhost:5000)
├── tailwind.config.js         # Custom Command Center theme
├── postcss.config.js          # PostCSS processor
├── .gitignore                 # Frontend git ignore rules
└── package.json               # Dependencies and scripts
```

---

## ✨ Key UI Features

1. **Role & Persona Switcher (No Login Required)**:
   - Easily toggle between **Donor** (Restaurant) and **Volunteer** roles.
   - Select specific personas with capacities and assigned zones.

2. **Simulated Clock Controls**:
   - Live simulated clock displayed in the header.
   - Advance clock by `+15m`, `+1h`, `+1d`, or enter a custom date-time.
   - Reset button to re-initialize data from `seed.json`.

3. **Rescue Now Queue**:
   - Highlighted section displaying the top 3 most urgent open missions sorted by closest pickup deadline.

4. **Live Mission Cards & Countdown**:
   - Progress bar showing % of food collected.
   - Status indicators (`Open for Rescue`, `Partially Reserved`, `Fully Reserved`, `Expired`, `Cancelled`).
   - Urgent countdown alerts (pulsing red when $<15$m remaining, amber when $<60$m).

5. **Impact & Reconciliation Dashboard**:
   - Live audit badge showing whether total listed kilograms match the sum of all outcomes (`Totals Balanced`).
   - Recharts visual bar chart of kilogram distribution.
   - Leaderboards for donors and volunteers (tracking collected kg and missed claims).

---

## 🚀 How to Run Frontend

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 3. Build for Production
```bash
npm run build
```
Creates an optimized production bundle in `dist/`.

---

## ☁️ Deploying Frontend to Vercel

1. Import your repository into Vercel.
2. Set **Root Directory** to `frontend`.
3. Framework Preset: **Vite** (automatically detected).
4. Under **Environment Variables**, add:
   - `VITE_API_URL`: URL of your deployed backend (e.g. `https://your-backend.vercel.app`).
5. Click **Deploy**.
6. Your frontend is live with full SPA routing supported by `frontend/vercel.json`.

