# SurplusLink — Backend Service 🚀

Node.js + Express.js backend implementing the complete business logic, simulated clock, and mass conservation calculations for SurplusLink.

---

## 🛠 Tech Stack

- **Runtime**: Node.js (ES Modules, JavaScript)
- **Framework**: Express.js
- **Database**: MongoDB Atlas / local MongoDB (via Mongoose)
- **Environment**: dotenv, cors
- **Testing**: Built-in Node test suite / assert

---

## 📂 Architecture & Directory Structure (MVC)

```
backend/
├── src/
│   ├── models/                # Data Layer (Mongoose Schemas)
│   │   ├── Donor.js           # Donor details: id, name, zone
│   │   ├── Volunteer.js       # Volunteer details: id, name, capacity_kg, zones
│   │   ├── Donation.js        # Donation details: quantity_kg, times, is_cancelled
│   │   ├── Claim.js           # Claim details: planned_time, quantity_kg, status
│   │   ├── AppState.js        # Simulated clock & seed state
│   │   └── index.js           # Central models export
│   │
│   ├── controllers/           # HTTP Request/Response Layer
│   │   ├── clockController.js # getClock, updateClock
│   │   ├── donorController.js # getDonors
│   │   ├── volunteerController.js # getVolunteers
│   │   ├── donationController.js  # getDonations, createDonation, cancelDonation
│   │   ├── claimController.js     # getClaims, createClaim, collectClaim, cancelClaim
│   │   └── dashboardController.js # getDashboard, getRescueNow, resetDatabase
│   │
│   ├── routes/                # Route Definitions
│   │   ├── clockRoutes.js     # /api/clock
│   │   ├── donorRoutes.js     # /api/donors
│   │   ├── volunteerRoutes.js # /api/volunteers
│   │   ├── donationRoutes.js  # /api/donations
│   │   ├── claimRoutes.js     # /api/claims
│   │   ├── dashboardRoutes.js # /api/dashboard & /api/rescue-now
│   │   └── index.js           # Combines all routers under /api
│   │
│   ├── services/              # Core Business Rules & Domain Logic
│   │   ├── rescueService.js   # Evaluates all 7 claim rules, status transitions, math
│   │   └── seedService.js     # Auto-loads seed.json on empty database
│   │
│   ├── utils/                 # Utilities
│   │   └── timeUtils.js       # Local ISO time math and status precedence
│   │
│   └── server.js              # Server entry point & DB connection
│
├── tests/
│   └── test_rules.js          # Unit tests verifying business rules & math
├── .env                       # Environment configuration
├── .env.example               # Example template
├── .gitignore                 # Backend git ignore rules
├── seed.json                  # Initial seed dataset
└── package.json               # Backend dependencies and scripts
```

---

## ⚙️ Environment Configuration (`.env`)

Inside `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.00yjjvs.mongodb.net/surpluslink?retryWrites=true&w=majority
```

---

## 📋 Business Logic & Rules Enforced

1. **Simulated Clock ("Now")**:
   - Initialized from `seed.json` (`2026-10-09T18:00`).
   - Time moves forward or stays the same; **never moves backward**.
   - When clock moves past a donation's deadline, active claims become `MISSED`.

2. **Donation Rules**:
   - Quantity must be whole number $\ge 1$ kg.
   - `pickup_from < pickup_until` and `pickup_until >= now`.
   - Donor can cancel donation **only while it is OPEN and has no ACTIVE or COLLECTED claims**.
   - Precedence: `CANCELLED` $\rightarrow$ `EXPIRED` $\rightarrow$ `FULLY_CLAIMED` $\rightarrow$ `OPEN`.

3. **Claim Validation (All 7 Rules)**:
   - Rule 1: Donation is not CANCELLED or EXPIRED.
   - Rule 2: Quantity $\le$ volunteer capacity.
   - Rule 3: Quantity $\le$ remaining kg.
   - Rule 4: Donation zone is in volunteer's zones.
   - Rule 5: Planned pickup time within window, inclusive.
   - Rule 6: Planned pickup time $\ge$ current simulated time.
   - Rule 7: Planned pickup time $\ge 60$ minutes from any other active/collected claim of that volunteer.
   - *Reports all violated rules together.*

4. **Claim Actions**:
   - **Collect**: Allowed only within donation pickup window.
   - **Cancel**: Allowed only strictly before planned pickup time (food returns to remaining kg).

5. **Conservation of Mass Dashboard**:
   - Formula:
     $$\text{Listed} = \text{Collected} + \text{Missed} + \text{Wasted} + \text{In progress} + \text{Still open}$$
   - Returns reconciliation status (`isBalanced: true / false`), donor rankings, and volunteer metrics.

---

## 🚀 How to Run Backend

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
# Production start:
npm start

# Development mode (auto-reload on code change):
npm run dev
```
Server runs on: **`http://localhost:5000`**

### 3. Run Unit Tests
```bash
npm test
```
Runs `tests/test_rules.js` and validates all domain logic and calculations.

---

## ☁️ Deploying Backend to Vercel

1. Import your repository into Vercel.
2. Set **Root Directory** to `backend`.
3. Framework Preset: **Other** (detected via `backend/vercel.json`).
4. Under **Environment Variables**, add:
   - `MONGODB_URI`: your MongoDB Atlas connection string.
5. Click **Deploy**.
6. Your backend will be live at `https://your-backend-project.vercel.app/api`.

