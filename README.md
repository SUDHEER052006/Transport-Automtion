# 🚌 GCET Campus Bus Tracker

Live campus bus arrival/departure tracking for Geethanjali College of Engineering and Technology.

**Three roles:**
- **Student** — see live bus status, schedules, and transport alerts (no login)
- **Transport Incharge** — manage routes, broadcast alerts, view daily reports (password)
- **Watch Tower (Guard)** — log bus arrivals/departures and odometer readings (password)

Installable as an app (PWA) on any phone/tablet — data syncs live across all devices via Firebase.

---

## 🏃 Run locally

```bash
npm install
npm run dev        # opens on http://localhost:5173
```

---

## 🚀 One-time deployment setup

### Step 1 — Firebase (makes data sync across devices)

Without this step the app still works, but each device keeps its own separate data
(you'll see a "📴 Device-only" badge at the bottom right instead of "🌐 Live Sync").

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Create project** (name it anything, e.g. `gcet-bus-tracker`; Google Analytics not needed)
2. On the project overview page click the **Web icon `</>`** → register the app (any nickname, no hosting needed)
3. Firebase shows you a `firebaseConfig` object — **copy those values into [`src/firebaseConfig.js`](src/firebaseConfig.js)**, replacing the `PASTE_...` placeholders
4. In the left sidebar: **Build → Firestore Database → Create database** → choose location → **Start in test mode**
5. (After testing) In the **Rules** tab, replace the rules with this — allows only this app's single document, without an expiry date:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /campus-bus-tracker/{docId} {
      allow read, write: if true;
    }
  }
}
```

> ⚠️ These rules are public (anyone with the URL can write). Fine for a college
> project; for stronger security, add Firebase Authentication later.

### Step 2 — GitHub Pages (hosting)

1. Create a repository on GitHub named **`campus-bus-tracker`**
   > If you pick a different name, also change `base` in [`vite.config.js`](vite.config.js) to `'/<your-repo-name>/'`
2. Push this project:

```bash
git remote add origin https://github.com/<your-username>/campus-bus-tracker.git
git push -u origin master
```

3. On GitHub: repo → **Settings → Pages → Source: GitHub Actions**
4. The included workflow ([.github/workflows/deploy.yml](.github/workflows/deploy.yml)) builds and deploys automatically on every push. First deploy takes ~2 minutes.
5. Your app is live at: `https://<your-username>.github.io/campus-bus-tracker/`

### Step 3 — Install on phones/tablets

Open the URL in Chrome (Android) or Safari (iPhone/iPad) →
**⋮ menu → Add to Home Screen**. The app opens full-screen with the college logo,
like a native app. Works offline for viewing (last-synced data).

---

## 🔑 Login

| Role | Password |
|------|----------|
| Transport Incharge | `admin` |
| Watch Tower | `admin` |

Change it in [`src/App.jsx`](src/App.jsx) (`AUTHORIZED_HASH` — see `hashString`).

## 🧠 How data works

- All state (bus statuses, activity log, alerts) lives in **one Firestore document** (`campus-bus-tracker/state`), synced live to every open device
- localStorage is the offline cache / fallback
- At midnight (IST) the first device to connect resets bus statuses and the daily log; **routes and alerts are kept**

## 🛠 Tech

React 19 + Vite · Firebase Firestore · PWA (manifest + service worker) · xlsx report export

Developed by S.SUDHEER © 2025 GCET
