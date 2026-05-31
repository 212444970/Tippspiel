# Tippspiel · World Cup 2026

Football tipping app for FIFA World Cup 2026. Users submit score predictions before each match; points are awarded automatically when results come in.

**Scoring:** 4 pts for exact score · 2 pts for correct tendency · 0 pts wrong

---

## Project structure

```
Tippspiel/
├── backend/        Express API (deploy to Railway)
└── frontend/       React + Vite SPA (deploy to Firebase Hosting)
```

---

## 1. Firebase setup

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and create a project.
2. **Authentication** → Sign-in methods → enable **Email link (passwordless)**.
3. **Firestore** → Create database (start in production mode).
4. **Project Settings → Your apps** → Add a Web app → copy the config into `frontend/.env`.
5. **Project Settings → Service Accounts** → Generate new private key → download JSON.
   - Copy `project_id`, `client_email`, and `private_key` into `backend/.env`.

---

## 2. API-Football setup

1. Register at [api-football.com](https://www.api-football.com/) (free tier: 100 req/day).
2. Copy your API key into `backend/.env` as `API_FOOTBALL_KEY`.
3. The World Cup 2026 league ID is **`1`** and season is **`2026`** (already set in `.env.example`).

---

## 3. Local development

### Backend
```bash
cd backend
cp .env.example .env        # fill in your values
npm install
npm run dev                  # runs on http://localhost:3001
```

### Frontend
```bash
cd frontend
cp .env.example .env         # fill in Firebase config + VITE_API_URL=http://localhost:3001
npm install
npm run dev                  # runs on http://localhost:5173
```

---

## 4. Deploy backend to Railway

1. Push this repo to GitHub.
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub repo → select the `backend/` folder (or set root directory to `backend`).
3. Add environment variables in Railway dashboard (copy from `backend/.env`).
4. Railway will build using the `Dockerfile` and expose a public URL — copy it.

---

## 5. Deploy frontend to Firebase Hosting

```bash
npm install -g firebase-tools
cd frontend

# Set production API URL
echo "VITE_API_URL=https://your-railway-backend.up.railway.app" >> .env

npm run build

firebase login
firebase use YOUR_FIREBASE_PROJECT_ID
firebase deploy --only hosting
```

After deploy, add the Firebase Hosting URL to Firebase Auth → **Authorized domains**.

Also update `backend/.env` → `FRONTEND_URL` with the production Firebase URL and redeploy.

---

## 6. Firestore security rules

In the Firebase Console → Firestore → Rules, paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read leaderboard data
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if false; // only backend writes via Admin SDK
    }
    // Tips are private per user
    match /tips/{tipId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow write: if false; // only backend writes
    }
    // Cache is backend-only
    match /_cache/{doc} {
      allow read, write: if false;
    }
  }
}
```

---

## API endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | – | Health check |
| GET | `/api/matches` | ✓ | Fixtures (optional `?round=`) |
| GET | `/api/matches/rounds` | ✓ | Available rounds |
| POST | `/api/tips` | ✓ | Submit/update a tip |
| GET | `/api/tips/me` | ✓ | Your tips |
| GET | `/api/tips/fixture/:id` | ✓ | Your tip for one match |
| GET | `/api/leaderboard` | ✓ | All users ranked |
| POST | `/api/evaluate` | – | Manually trigger evaluation |

Evaluation runs automatically every 15 minutes via cron.
