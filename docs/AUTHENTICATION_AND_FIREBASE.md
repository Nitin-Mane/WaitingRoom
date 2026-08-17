# Authentication & Firebase Integration Guide

## 1. Overview

WaitingRoom provides a dual authentication architecture:
1. **Firebase Console Cloud Authentication:** Connects with your live Firebase Project for secure cloud authentication.
2. **Local-First Offline Profile Sandbox:** Built-in profiles allowing immediate offline work and rapid role switching.

---

## 2. Connecting to Firebase Console

1. Navigate to the **[Firebase Console](https://console.firebase.google.com/)**.
2. Create or select your Firebase project.
3. In **Project Settings $\rightarrow$ General**, add a **Web App** (e.g. `WaitingRoom Web`).
4. Copy the `firebaseConfig` object values:
   - `apiKey`
   - `authDomain`
   - `projectId`
5. Enable **Email/Password** authentication under **Build $\rightarrow$ Authentication $\rightarrow$ Sign-in method**.
6. In WaitingRoom, click **"Connect Firebase Console"** on the login screen or in **Settings**, enter your credentials, and click **Save & Connect**.

---

## 3. Local-First & Privacy Guarantees

- When working offline or without Firebase credentials, WaitingRoom stores all records in client-side **IndexedDB**.
- No dependency descriptions, financial amounts, or contact records are ever transmitted to unauthorized external services.
