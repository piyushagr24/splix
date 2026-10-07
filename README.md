# Splix

Split shared expenses with zero login friction.

**Live Demo:** https://splix-app.vercel.app

Splix is a zero-friction group expense splitter built for the way people actually share bills: create a group, get an edit link and a view link, add expenses , and settle up instantly without forcing anyone through signups.

---

## Why Try Splix?

- No accounts, no OTPs, no signup wall
- Separate **Edit** and **View** links for cleaner sharing
- PIN-protected edit access
- Instant settlement plan with UPI support
- Receipt-style PDF export for a clean final summary
- Mobile-first UI designed for real group usage

![landing-page](screenshots/landing-page.png)

---

## Walkthrough

### 1. Create a group in seconds
Set a group name, choose currency, create a 4-digit PIN, and add participants.
Use unique particpants name to avoid confusion.
![create-group](screenshots/create-group.png)

### 2. Share the right link with the right people
- **Edit link** for trusted editors
- **View link** for read-only sharing

No account setup. No waiting around.

![links](screenshots/links.png)

### 3. Add expenses with flexible splits
Track who paid and split costs using:
- even split
- uneven by amount
- uneven by percentage

![add-expense](screenshots/add-expense.png)

### 4. Settle up fast
Splix simplifies balances into the minimum practical set of payments and supports:
- Pay with UPI
- QR-based settlement
- copy UPI flow
- manual mark-as-settled state

![settlement](screenshots/settlement.png)

**after adding UPI ID**
![upi-added](screenshots/upi-added.png)

### 5. Export a clean summary
Download a receipt-style PDF with:
- group details
- expense log
- final settlements
- totals

![pdf](screenshots/pdf.png)

---

## Recommended Usage

To get the best experience with Splix:

- **Remember the group PIN**
  You will need it to unlock edit access later.

- **Save the Edit link somewhere safe**
  The edit link is the control link for your group.

- **Add your UPI ID in profile** 
  This enables faster direct settlement with Pay with UPI and QR.

- **Download the PDF when the trip or event ends** 
  It is the cleanest final summary to save or share.

---

## Built For

Splix works well for things like:
- trips
- flat expenses
- dinners and outings
- college group spends
- small event sharing

---

## Tech Stack

### Frontend
- React
- Vite
- React Router
- Tailwind CSS
- Framer Motion

### Backend
- Node.js
- Express
- Mongoose
- MongoDB
- Joi
- JWT
- pdf-lib

---

## For Devs

### Prerequisites

- Node.js 20.19+ or 22.12+
- MongoDB instance (local or Atlas)

### Installation

Clone the repository:

```bash
git clone https://github.com/piyushagr24/splix.git
cd splix
```

Install dependencies:

```bash
npm --prefix server install
npm --prefix client install
```

### Environment Setup

Create env files:
- `server/.env`
- `client/.env` (optional if using `http://localhost:4000`)

**`server/.env`**

```env
MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-long-random-secret
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
CLEANUP_INACTIVE_DAYS=45
```

**`client/.env`**

```env
VITE_API_BASE_URL=http://localhost:4000
```

### Run Locally

Start the backend:

```bash
npm --prefix server run dev
```

Start the frontend:

```bash
npm --prefix client run dev
```

Open:

```text
http://localhost:5173
```

### Manual Cleanup

Inactive groups can be cleaned manually.

Dry run:

```bash
npm --prefix server run cleanup:inactive-groups -- --dry-run
```

Actual cleanup:

```bash
npm --prefix server run cleanup:inactive-groups
```

Default retention window:
- `45` days

---

## Production Deployment (Zero Cold Starts)

Splix backend is optimized to run without 50+ second free-tier delays (avoiding Render's idle freeze). Choose either **Vercel Serverless** or **Railway / Koyeb**:

### Option A: Vercel Serverless (Recommended)

1. **Import the repository** into Vercel.
2. In the project settings, set:
   - **Root Directory**: `server`
   - **Framework Preset**: Other
3. Set the following **Environment Variables**:
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: A secure random secret string.
   - `CORS_ORIGIN`: Your frontend URL(s), e.g. `https://splix-app.vercel.app` (supports comma-separated list and `*.vercel.app` preview branches).
   - `CRON_SECRET`: (Optional) Secret key to protect the automated daily cleanup cron.
4. **Deploy**:
   - The backend runs via `server/api/index.js` with global connection caching and 15s max timeout.
   - Vercel Cron automatically triggers `/api/cron/cleanup` daily at midnight to purge groups older than 45 days.

### Option B: Railway or Koyeb (Persistent Container)

1. Connect your Splix repository on [Railway](https://railway.app) or [Koyeb](https://www.koyeb.com).
2. Configure the deployment:
   - **Root Directory**: `server`
   - Railway will automatically detect `server/Dockerfile` and `server/railway.json`.
3. Set Environment Variables:
   - `PORT`: `4000` (or Railway's dynamic port)
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure secret string
   - `CORS_ORIGIN`: `https://splix-app.vercel.app`
4. The service will run as an always-on Node 20 container with non-root security and clean SIGTERM/SIGINT teardowns.

### Frontend Deployment (Vercel)

1. In Vercel, create a second project for the frontend (or deploy from root):
   - **Root Directory**: `client`
   - **Framework Preset**: Vite
   - **Environment Variable**: `VITE_API_BASE_URL` pointing to your deployed backend URL (e.g. `https://splix-api.vercel.app` or `https://splix.up.railway.app`).

