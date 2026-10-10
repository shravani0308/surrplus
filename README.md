# SurplusLink — Live Food Rescue Command Center 🥗🚚

SurplusLink is a real-time food rescue operations dashboard connecting commercial restaurants and donors with city volunteers to rescue surplus cooked food before pickup windows close. Every kilogram counts. Every minute matters.

---

## 📌 Product Overview & Problem Statement

At closing time, commercial kitchens and restaurants frequently have surplus cooked food that would otherwise go to waste. Simultaneously, local volunteers and NGOs are available to rescue and distribute this food if provided with clear timing windows, vehicle capacity checks, and location coordinates.

SurplusLink solves this with an operational command center that:
1. Enables restaurants to post surplus food batches with strict pickup windows.
2. Enables volunteers to claim and collect food matching their vehicle capacity and operating zones.
3. Enforces concurrency protection to ensure donations are never overbooked.
4. Manages an authoritative simulated clock ("Now") independent of real-world system time.
5. Audits total food conservation through a mathematical mass balance equation.

---

## 📂 Architecture & Directory Structure

The project is organized strictly into two standalone folders: `backend/` and `frontend/`.

```
├── backend/
│   ├── src/
│   │   ├── models/                # Data Layer (Mongoose Schemas)
│   │   │   ├── Donor.js           # Donor profiles: id, name, zone
│   │   │   ├── Volunteer.js       # Volunteer profiles: id, name, capacity_kg, zones
│   │   │   ├── Donation.js        # Food postings: quantity_kg, times, is_cancelled
│   │   │   ├── Claim.js           # Volunteer claims: planned_time, quantity_kg, status
│   │   │   ├── AppState.js        # Persistent simulated clock & seed state
│   │   │   └── index.js           # Central models export
│   │   │
│   │   ├── controllers/           # Request & Response Handlers
│   │   │   ├── clockController.js # Read and update the simulated clock
│   │   │   ├── donorController.js # Retrieve donor profiles
│   │   │   ├── volunteerController.js # Retrieve volunteer profiles
│   │   │   ├── donationController.js  # Create, list, and cancel donations
│   │   │   ├── claimController.js     # Create, collect, and cancel claims
│   │   │   └── dashboardController.js # Impact dashboard, Rescue Now queue, reset
│   │   │
│   │   ├── routes/                # Express Routers (API Endpoints)
│   │   │   ├── clockRoutes.js     # /api/clock
│   │   │   ├── donorRoutes.js     # /api/donors
│   │   │   ├── volunteerRoutes.js # /api/volunteers
│   │   │   ├── donationRoutes.js  # /api/donations
│   │   │   ├── claimRoutes.js     # /api/claims
│   │   │   ├── dashboardRoutes.js # /api/dashboard & /api/rescue-now
│   │   │   └── index.js           # Master router aggregating all routes under /api
│   │   │
│   │   ├── services/              # Core Business Rules & Domain Logic
│   │   │   ├── rescueService.js   # 7 Claim rules, status transitions, math audits
│   │   │   └── seedService.js     # Auto-populates seed.json on empty database
│   │   │
│   │   ├── utils/                 # Utilities
│   │   │   └── timeUtils.js       # Local ISO time math and status precedence
│   │   │
│   │   └── server.js              # Express app bootstrap & MongoDB Atlas connection
│   │
│   ├── tests/
│   │   └── test_rules.js          # Unit tests verifying business rules & math
│   ├── .env                       # Environment configuration (PORT, MONGODB_URI)
│   ├── .env.example               # Environment template
│   ├── .gitignore                 # Backend git ignore
│   ├── vercel.json                # Vercel serverless configuration
│   ├── seed.json                  # Initial dataset
│   ├── README.md                  # Backend documentation
│   └── package.json               # Backend dependencies and scripts
│
└── frontend/
    ├── src/
    │   ├── components/            # Reusable UI Components
    │   │   ├── Navbar.jsx         # Top bar with Persona switcher & Clock controls
    │   │   ├── MissionCard.jsx    # Live mission card with progress bar, countdown & actions
    │   │   ├── CountdownTimer.jsx # Live countdown driven by backend simulated clock
    │   │   ├── RescueProgress.jsx # Visual progress bar (collected / total * 100)
    │   │   ├── RescueNowQueue.jsx # Top urgent missions sorted by closest deadline
    │   │   ├── DonationModal.jsx  # Modal form for Donors to post surplus food
    │   │   └── ClaimModal.jsx     # Modal form for Volunteers with 7-rule validation
    │   │
    │   ├── pages/                 # Main Application Views
    │   │   ├── LiveCommandCenter.jsx   # Visual Centerpiece: Rescue Now queue & missions
    │   │   ├── DonorWorkspace.jsx      # Donor view: post food, manage donations & claims
    │   │   ├── VolunteerWorkspace.jsx  # Volunteer view: available food, active claims, collect
    │   │   └── ImpactDashboard.jsx     # Mass conservation audit & visual Recharts chart
    │   │
    │   ├── api.js                 # API client (clean fetch calls to /api/...)
    │   ├── App.jsx                # Root component managing active persona, tabs & data
    │   ├── index.css              # Tailwind CSS styles & custom scrollbars
    │   └── main.jsx               # React DOM entry point
    │
    ├── index.html                 # App shell with title and metadata
    ├── vite.config.js             # Vite setup with proxy and file polling
    ├── tailwind.config.js         # Custom Command Center theme
    ├── postcss.config.js          # PostCSS processor
    ├── vercel.json                # Vercel SPA routing configuration
    ├── .gitignore                 # Frontend git ignore
    ├── README.md                  # Frontend documentation
    └── package.json               # Frontend dependencies and scripts
```

---

## ⚙️ Backend Architecture & Features

### 1. Technology Stack
- **Runtime**: Node.js (ES Modules, pure JavaScript)
- **Framework**: Express.js
- **Database**: MongoDB Atlas / local MongoDB (Mongoose)
- **Environment**: dotenv, cors

### 2. Environment Configuration (`backend/.env`)
The backend connects to MongoDB Atlas using the connection string specified in `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.00yjjvs.mongodb.net/surpluslink?retryWrites=true&w=majority
```

### 3. Data Models
- **Donor**: Unique ID, restaurant name, operational zone.
- **Volunteer**: Unique ID, volunteer name, vehicle capacity in kg, array of allowed zones.
- **Donation**: Unique ID, donor reference, description, quantity in kg, pickup start (`pickup_from`), pickup deadline (`pickup_until`), cancellation status (`is_cancelled`).
- **Claim**: Unique ID, donation reference, volunteer reference, claimed kg, planned pickup time ($T$), status (`ACTIVE`, `COLLECTED`, `CANCELLED`, `MISSED`).
- **AppState**: Current simulated clock time (`YYYY-MM-DDTHH:MM`), seeding status.

### 4. Authoritative Simulated Clock ("Now")
- System time (`Date.now()`) is never used for business decisions.
- Initialized from `seed.json` (`2026-10-09T18:00`) and persisted in MongoDB.
- Users can advance the clock (+15m, +1h, +1d, or custom future date-time).
- **Rule**: The clock can never move backward.
- **Automated Expirations**: When the clock advances past a donation's `pickup_until`:
  - Donation status becomes `EXPIRED`.
  - All pending `ACTIVE` claims on that donation automatically become `MISSED`.

### 5. Donation Posting & Cancellation Rules
- Quantity must be a whole number of at least 1 kg.
- `pickup_from` must precede `pickup_until`.
- `pickup_until` cannot precede the current simulated time.
- Status precedence: `CANCELLED` $\rightarrow$ `EXPIRED` $\rightarrow$ `FULLY_CLAIMED` $\rightarrow$ `OPEN`.
- A donor can cancel a donation **only while it is OPEN and has no ACTIVE or COLLECTED claims**.

### 6. Claim Validation Engine (All 7 Rules Enforced)
When a volunteer submits a claim, all seven mandatory rules are evaluated and all violations are reported simultaneously:
1. **Rule 1**: The donation is neither `CANCELLED` nor `EXPIRED`.
2. **Rule 2**: Claimed quantity does not exceed the volunteer's capacity.
3. **Rule 3**: Claimed quantity does not exceed the donation's remaining unreserved quantity.
4. **Rule 4**: The donation's zone belongs to the volunteer's allowed zones.
5. **Rule 5**: Planned pickup time ($T$) is within the donation's pickup window, inclusive.
6. **Rule 6**: Planned pickup time ($T$) is not before the current simulated time.
7. **Rule 7**: Planned pickup time ($T$) is at least 60 minutes apart from every other ACTIVE or COLLECTED claim belonging to that volunteer.

### 7. Claim Actions
- **Collect**: A volunteer can mark an ACTIVE claim `COLLECTED` only when the current simulated time is within the pickup window, inclusive.
- **Cancel**: A volunteer can cancel an ACTIVE claim only if the current simulated time is strictly before the planned pickup time ($T$). Cancelled quantity immediately returns to the donation's available remaining quantity.

### 8. Mass Conservation Audit Equation
The backend audits food quantities across all non-cancelled donations:
$$\text{Listed} = \text{Collected} + \text{Missed} + \text{Wasted} + \text{In progress} + \text{Still open}$$
- **Listed**: Total quantity posted.
- **Collected**: Kilograms in `COLLECTED` claims.
- **Missed**: Kilograms in `MISSED` claims.
- **Wasted**: Unclaimed remaining kilograms on `EXPIRED` donations.
- **In progress**: Kilograms in `ACTIVE` claims.
- **Still open**: Unclaimed remaining kilograms on active (non-expired) donations.
- Returns `isBalanced: true / false` alongside donor leaderboards and volunteer performance stats.

---

## 💻 Frontend Architecture & Features

### 1. Technology Stack
- **Framework**: React.js 18 (Vite)
- **Language**: Pure JavaScript (`.jsx` / `.js`)
- **Styling**: Tailwind CSS (Command Center dark theme)
- **Icons**: Lucide React
- **Visualizations**: Recharts (Dynamic Bar Chart)

### 2. Persona Switcher (No Login)
- Instant toggle between **Donor** (Restaurant) and **Volunteer** roles.
- Dropdown to select individual test personas (e.g., Green Leaf Bistro, Alice Smith) with their live capacities and assigned zones.

### 3. Live Rescue Command Center
- **Rescue Now Queue**: Highlights the top 3 most urgent donations prioritized by closest pickup deadline.
- **Live Mission Cards**: Displays food description, donor name, zone badge, remaining kg, reserved kg, collected kg, and live rescue progress bar.
- **Urgent Countdown Timers**: Synchronized with the backend simulated clock.
  - Normal styling for $>60$ minutes remaining.
  - Amber badge for $16$–$60$ minutes remaining.
  - Pulsing red badge for $\le 15$ minutes remaining.
  - Gray badge when pickup window is closed.
- **Search & Filters**: Real-time filtering by text search, geographic zone, and donation status.

### 4. Dedicated Workspaces
- **Donor Workspace**: Post new surplus food batches, inspect incoming volunteer claims, and cancel open donations.
- **Volunteer Workspace**: View available surplus food matching assigned zones, manage active reservations, mark claims as collected during pickup windows, and cancel claims before planned pickup times.
- **Impact & Reconciliation Dashboard**: Live conservation formula audit badge ("Totals Balanced"), visual Recharts distribution chart, donor rescue leaderboards, and volunteer statistics.

---

## 🚀 Installation & Running Guide

### 1. Start the Backend Service

```bash
cd backend
npm install
npm start
```
- The backend runs on: **`http://localhost:5000`**
- Connects to MongoDB Atlas via `backend/.env`.
- Automatically populates the database from `backend/seed.json` on first launch.

### 2. Start the Frontend Client

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```
- The frontend runs on: **`http://localhost:3000`**
- Configured with Vite proxying `/api` requests directly to `http://localhost:5000`.

### 3. Run Automated Tests

In the `backend` folder:

```bash
cd backend
npm test
```
- Executes `backend/tests/test_rules.js`.
- Verifies time calculations, remaining kg accounting, status precedence, all 7 claim rules, and the conservation of mass equation.

---

## ☁️ Deploying to Vercel (Step-by-Step)

Both the **Backend** and **Frontend** are pre-configured with `vercel.json` and serverless handlers for effortless deployment on Vercel.

### Step 1: Deploy Backend to Vercel
1. Go to the [Vercel Dashboard](https://vercel.com/) and click **Add New Project**.
2. Import your GitHub repository.
3. In **Project Settings**:
   - **Root Directory**: Select `backend`
   - **Framework Preset**: Other (automatically detected via `backend/vercel.json`)
4. In **Environment Variables**, add:
   - Name: `MONGODB_URI`
   - Value: `mongodb+srv://`
5. Click **Deploy**.
6. Once deployed, copy your backend production URL (e.g., `https://surpluslink-backend.vercel.app`).

### Step 2: Deploy Frontend to Vercel
1. In Vercel, click **Add New Project** again and import the same repository.
2. In **Project Settings**:
   - **Root Directory**: Select `frontend`
   - **Framework Preset**: `Vite`
3. In **Environment Variables**, add:
   - Name: `VITE_API_URL`
   - Value: Your backend URL from Step 1 (e.g., `https://surpluslink-backend.vercel.app`)
4. Click **Deploy**.
5. Your live SurplusLink application is now deployed and running!

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/clock` | Get current simulated clock time |
| `POST` | `/api/clock` | Advance simulated clock (`{ clock }`) |
| `GET` | `/api/donors` | Retrieve all donor profiles |
| `GET` | `/api/volunteers` | Retrieve all volunteer profiles |
| `GET` | `/api/donations` | Retrieve all donations with enriched status and claims |
| `POST` | `/api/donations` | Post a new donation |
| `POST` | `/api/donations/:id/cancel` | Cancel an open donation |
| `GET` | `/api/claims` | List claims (supports `volunteer_id` and `donation_id` filters) |
| `POST` | `/api/claims` | Submit a claim (evaluates all 7 rules) |
| `POST` | `/api/claims/:id/collect` | Mark an active claim as COLLECTED |
| `POST` | `/api/claims/:id/cancel` | Cancel an active claim |
| `GET` | `/api/rescue-now` | Retrieve prioritized urgent open donations |
| `GET` | `/api/dashboard` | Retrieve mass conservation metrics, formula balance, and leaderboards |
| `POST` | `/api/seed/reset` | Reset database back to `backend/seed.json` |
| `GET` | `/api/health` | Health check and database connectivity status |
