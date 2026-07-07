# ResumeBuilder Pro — Firebase setup

The app is fully wired for auth + cloud sync — you just need to point it at your own Firebase project. Nothing will work (sign-in will show a "Firebase isn't configured yet" error) until you complete these steps.

## 1. Create a Firebase project
1. Go to https://console.firebase.google.com → **Add project** → follow the prompts (Analytics is optional, you can skip it).

## 2. Register a Web app
1. In your new project, click the **</>** (web) icon to add a web app.
2. Give it any nickname. You don't need Firebase Hosting for this step.
3. Firebase will show you a `firebaseConfig` object — copy it.

## 3. Paste your config into `index.html`
Open `index.html` and find this block near the top (`FIREBASE CONFIG`):

```js
window.FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

Replace each value with the matching field from the config Firebase gave you.

## 4. Turn on Authentication
1. In the Firebase console: **Build → Authentication → Get started**.
2. Enable **Email/Password**.
3. Enable **Google** (pick a support email when prompted).
4. Under **Settings → Authorized domains**, make sure the domain you'll host this on is listed (`localhost` is there by default for local testing).

## 5. Turn on Firestore
1. **Build → Firestore Database → Create database**.
2. Choose **Start in production mode** (not test mode — the rules below lock it down properly).
3. Pick a region close to you.

## 6. Set Firestore security rules
In **Firestore → Rules**, replace the default rules with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/resumes/{resumeId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

This makes sure a signed-in user can only ever read or write their **own** resumes — nobody else's data is reachable, even by guessing document IDs.

Click **Publish**.

## 7. Test it
Open `index.html` in a browser (or host the whole `app/` folder — e.g. drag-and-drop onto Firebase Hosting, Netlify, or Vercel). You should be able to:
- Sign up with email/password or Google
- Edit your resume, hit **Save** → see "☁️ Synced"
- Sign in from a different browser/device → hit **Load** → see the same resume
- Try **Download PDF** while signed out → it now prompts you to sign in first

## What's already built for you
- Editing works with **no account required** — data is cached in `localStorage` as you go.
- Signing in switches Save/Load to Firestore (`users/{uid}/resumes/{id}`), with a local cache kept as an offline fallback.
- PDF/JSON/TXT/DOC downloads are gated behind sign-in.
- The app is a installable PWA already (`manifest.json` + `sw.js`) — "Add to Home Screen" works today on mobile.
- When you're ready for the App Store / Play Store, this same `app/` folder can be wrapped with **Capacitor** with minimal changes, since it's already a self-contained PWA.
