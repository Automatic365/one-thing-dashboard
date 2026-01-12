# Firebase Setup Guide

This guide will walk you through setting up Firebase for cross-device sync in under 10 minutes.

## Why Firebase?

- **Free Forever**: Generous free tier that you'll never exceed
- **Real-Time Sync**: Changes appear instantly on all your devices
- **Automatic Backup**: Your data is safely stored in the cloud
- **No Server Management**: Everything is handled for you

## Step 1: Create a Firebase Project (3 minutes)

1. **Go to Firebase Console**: https://console.firebase.google.com/

2. **Sign in** with your Google account (or create one if needed)

3. **Click "Add project"** (or "Create a project")

4. **Enter project name**: `one-thing-app` (or any name you like)
   - Click "Continue"

5. **Google Analytics**: Choose "Not right now" (you don't need this)
   - Click "Create project"

6. **Wait** for Firebase to create your project (30 seconds)
   - Click "Continue" when done

## Step 2: Register Your Web App (2 minutes)

1. **Click the Web icon** `</>` on your project homepage
   - It says "Add an app to get started"

2. **Register app**:
   - App nickname: `The ONE Thing`
   - Firebase Hosting: **Leave unchecked**
   - Click "Register app"

3. **Copy your Firebase config**
   - You'll see a code block with your config
   - It looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "one-thing-app-xxxx.firebaseapp.com",
  projectId: "one-thing-app-xxxx",
  storageBucket: "one-thing-app-xxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

4. **Keep this tab open!** You'll need these values in Step 4

## Step 3: Enable Authentication (2 minutes)

1. **In the left sidebar**, click "Authentication"

2. **Click "Get started"**

3. **Enable Email/Password**:
   - Click "Email/Password" in the Sign-in method list
   - Toggle "Email/Password" to **ENABLED**
   - Leave "Email link" disabled
   - Click "Save"

4. **Enable Google Sign-In**:
   - Click "Google" in the Sign-in method list
   - Toggle the switch to **ENABLED**
   - Enter your project support email (your Gmail address)
   - Click "Save"

Now users can sign in with either email/password OR their Google account!

## Step 4: Enable Firestore Database (2 minutes)

1. **In the left sidebar**, click "Firestore Database"

2. **Click "Create database"**

3. **Choose location**:
   - Select a location close to you (e.g., us-central1)
   - Click "Next"

4. **Start in production mode**
   - Select "Start in production mode"
   - Click "Create"

5. **Update Security Rules** (IMPORTANT!):
   - Click on the "Rules" tab at the top
   - Replace the existing rules with this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

6. **Click "Publish"**

This ensures only you can access your own data - complete privacy!

## Step 5: Configure Your App (2 minutes)

1. **Open the `index.html` file** in a text editor (TextEdit on Mac, Notepad on Windows)

2. **Find lines 135-142** - they look like this:

```javascript
const FIREBASE_CONFIG = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

3. **Replace the placeholder values** with YOUR values from Step 2

Example:
```javascript
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyBxxxxxxxxxxxxxxxxxxxxxx",
    authDomain: "one-thing-app-12345.firebaseapp.com",
    projectId: "one-thing-app-12345",
    storageBucket: "one-thing-app-12345.appspot.com",
    messagingSenderId: "987654321",
    appId: "1:987654321:web:abc123def456"
};
```

4. **Save the file** (Cmd+S on Mac, Ctrl+S on Windows)

## Step 6: Test It! (1 minute)

1. **Open `index.html`** in your browser (double-click the file)

2. **You should see a login screen** instead of the yellow warning

3. **Click "Don't have an account? Sign Up"**

4. **Create an account**:
   - Enter your email
   - Choose a password (at least 6 characters)
   - Click "Sign Up"

5. **You're in!** Your app is now syncing to the cloud

## Test Cross-Device Sync

1. **Set a goal** on your first device

2. **Open the app on another device** (or another browser)
   - Log in with the same email/password
   - Your goal should appear instantly!

3. **Changes sync in real-time** - try editing on one device and watch it update on the other

## Troubleshooting

### "Error: Invalid API key"
- Double-check you copied the ENTIRE API key from Firebase Console
- Make sure there are no extra spaces or quotes

### "Error: Permission denied"
- Go back to Firestore → Rules tab
- Make sure you published the security rules from Step 4

### Login screen doesn't appear
- Make sure you saved the index.html file after pasting your config
- Try refreshing the page (Cmd+R or Ctrl+R)
- Check browser console (F12) for errors

### Can't sign up / "Email already in use"
- If you already created an account, click "Already have an account? Log In"
- If you forgot your password, you'll need to reset it in Firebase Console → Authentication → Users

## Your Data is Private

- Only YOU can access your data (enforced by Firestore security rules)
- Firebase uses industry-standard encryption
- Your data syncs securely over HTTPS
- Even Firebase engineers can't read your goals without your explicit permission

## Free Tier Limits

You'll never hit these limits with normal use:

- **Storage**: 1 GB (your goals use ~1 KB)
- **Reads**: 50,000 per day (you'll use ~100)
- **Writes**: 20,000 per day (you'll use ~50)

You could use the app for YEARS without paying anything!

## Need Help?

If you get stuck, feel free to ask for help. Have these ready:

1. Screenshot of any error message
2. Your project ID (NOT your API key!)
3. What step you're on

---

**Enjoy your cross-device syncing!** Now you can access your ONE Thing from anywhere. 🎯
