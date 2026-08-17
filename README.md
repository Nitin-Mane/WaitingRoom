# WaitingRoom ⏳

> **Local-First Dependency & Follow-up Tracker for Desktop**  
> *Never lose track of what you're waiting for.*

---

<!-- Badges Section -->
<p align="center">
  <img src="https://img.shields.io/badge/CI%2FCD%20Pipeline-Passing-brightgreen?style=for-the-badge&logo=githubactions&logoColor=white" alt="CI/CD Status" />
  <img src="https://img.shields.io/badge/Version-1.0.0-indigo?style=for-the-badge" alt="Version" />
  <img src="https://img.shields.io/badge/Node.js-18%20%7C%2020%20%7C%2022-blue?style=for-the-badge&logo=node.js&logoColor=white" alt="Node Compatibility" />
  <img src="https://img.shields.io/badge/Storage-IndexedDB%20v1.0-emerald?style=for-the-badge&logo=databricks&logoColor=white" alt="IndexedDB" />
  <img src="https://img.shields.io/badge/Auth-Firebase%20%2B%20Offline-orange?style=for-the-badge&logo=firebase&logoColor=white" alt="Firebase Auth" />
  <img src="https://img.shields.io/badge/License-MIT-purple?style=for-the-badge" alt="License" />
</p>

---

## 🌟 Overview

Most task managers focus on what **you** need to do. **WaitingRoom** is built for the other half of your work: everything you are **waiting on from external parties** (recruiter responses, professor approvals, administrative credentials, code reviews, reimbursement sign-offs, and procurement deliveries).

WaitingRoom combines a **0–100 Blocking Impact Score Engine**, **deterministic follow-up recommendation policies**, an **animated kinetic triage workflow**, **Firebase cloud authentication**, and a **100% local-first IndexedDB database**.

---

## 📸 Visual Showcase & Screenshots

### 1. Overview Dashboard & Visualizations
*Animated Kinetic Risk Radar circular gauge, Category Velocity spectrum bars, and 14-Day Calendar Timeline Matrix:*
![Overview Dashboard](https://raw.githubusercontent.com/Nitin-Mane/WaitingRoom/main/docs/screenshots/dashboard_visualization_suite_1786964321148.png)

---

### 2. Waiting Items Directory & Multi-Faceted Filters
*Dense directory with real-time status filtering, category tabs, and blocking impact scores:*
![Waiting Items Directory](https://raw.githubusercontent.com/Nitin-Mane/WaitingRoom/main/docs/screenshots/waiting_items_directory_1786961067593.png)

---

### 3. Kinetic Focus Flow (Distraction-Free Triage)
*Rapid 1-by-1 triage card flow with factor score breakdowns, recommendation rationale, and one-click actions:*
![Kinetic Focus Mode](https://raw.githubusercontent.com/Nitin-Mane/WaitingRoom/main/docs/screenshots/kinetic_focus_flow_1786961144009.png)

---

### 4. Follow-Up Message Composer & Communication Templates
*Context-aware message generator with adjustable tones (Polite, Firm, Executive) and audit trail logging:*
![Follow-up Composer](https://raw.githubusercontent.com/Nitin-Mane/WaitingRoom/main/docs/screenshots/composer_view_1786961167461.png)

---

### 5. Notification Center & Real-Time Action Feed
*Categorized feed for Action Required, Completed Resolutions, Upcoming Deadlines, and Local System Status:*
![Notification Center](https://raw.githubusercontent.com/Nitin-Mane/WaitingRoom/main/docs/screenshots/notification_center_1786962376448.png)

---

### 6. Profile & Account Settings Suite
*User details, avatar customization, local-first sandbox diagnostics, and session switching:*
![Profile & Account Settings](https://raw.githubusercontent.com/Nitin-Mane/WaitingRoom/main/docs/screenshots/profile_settings_updated_1786962444667.png)

---

### 7. Animated Startup & Authentication
*Pulsing brand logo, glowing particle mesh, Sign In, Sign Up, and Profile-Based Quick Login:*
<p align="center">
  <img src="https://raw.githubusercontent.com/Nitin-Mane/WaitingRoom/main/docs/screenshots/sign_in_view_1786963060565.png" width="48%" alt="Sign In View" />
  <img src="https://raw.githubusercontent.com/Nitin-Mane/WaitingRoom/main/docs/screenshots/profiles_view_1786963094549.png" width="48%" alt="Profile Switcher" />
</p>


---

## 🚀 Key Features

- 🎯 **0–100 Blocking Impact Scoring Algorithm**: Multi-factor scoring ($0.28C + 0.22D + 0.18B + 0.14A + 0.08F + 0.10P$) prioritizing items gating critical paths.
- 🤖 **Deterministic Recommendation Engine**: Recommends `WAIT`, `FOLLOW_UP`, `ESCALATE`, `REVIEW`, `SNOOZE`, or `CLOSE` with explainable audit rationales.
- ⚡ **Kinetic Focus Mode**: Fullscreen keyboard-driven triage stream unblocking dependencies one by one.
- 📝 **Follow-Up Message Composer**: Auto-generates structured outreach templates with customizable tones (Polite, Firm, Executive).
- 📅 **14-Day Calendar Timeline Matrix**: Chronological SLA ribbon with glowing today highlights and deadline dot markers.
- 🎨 **4 Curated Theme Presets**: Instant 1-click switching between **Dark Navy**, **Midnight OLED**, **Cyberpunk Slate**, and **Clean Light**.
- 🔒 **Local-First & Firebase Auth**: Runs 100% offline via IndexedDB with optional Firebase Console project sync.
- ⌨️ **Command Palette (`Ctrl+K`)**: Rapid keyboard jump and search across items, contacts, and settings.
- 💾 **Data Portability**: Full JSON snapshot backups with SHA-256 checksums, plus CSV and Markdown export/import.

---

## 🏗️ System Architecture

<p align="center">
  <img src="docs/images/system_architecture_diagram.jpg" alt="WaitingRoom Architecture Diagram" width="100%" />
</p>

| Layer | Technology |
| :--- | :--- |
| **Frontend Shell** | HTML5 Semantic Architecture, Vanilla ES6+ JavaScript |
| **Styling & Themes** | Vanilla CSS Theme Tokens (`styles/theme.css`, `styles/main.css`) + Tailwind Utilities |
| **Database Engine** | Client-Side IndexedDB v1.0 (`WaitingRoomDB`) with transactional ACID stores |
| **Authentication** | Firebase JavaScript SDK (v10.12.2) + Local Profile Session Engine |
| **Testing** | Node.js Test Runner (`test/domain_test.js`) |
| **CI/CD** | GitHub Actions Workflow (`.github/workflows/ci.yml`) |

---

## 📦 Quick Start & Installation

### Prerequisites
- Node.js version `18.x`, `20.x`, or `22.x` installed.

### 1. Clone & Navigate
```bash
git clone https://github.com/your-org/waitingroom.git
cd waitingroom
```

### 2. Run Locally
```bash
npm start
```
The application will be live at:
👉 **`http://localhost:3000`**

### 3. Run Automated Tests
```bash
npm test
```
All 18 automated domain, state machine, and scoring engine tests will execute synchronously.

---

## 🧪 CI/CD Pipeline & Automated Verification

WaitingRoom includes a GitHub Actions continuous integration **and deployment** pipeline ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)):

```yaml
jobs:
  test-and-verify:         # Runs on Node 18.x, 20.x, 22.x — all branches & PRs
    steps:
      - npm test           # 18 domain / state machine / scoring engine tests
      - asset integrity    # Verifies index.html, app.js, CSS, firebase configs

  deploy:                  # Runs only on push to main/master
    needs: test-and-verify # Blocked until all matrix tests pass
    steps:
      - FirebaseExtended/action-hosting-deploy@v0
      # → https://waitingroom-eb72a.web.app
```

---

## 🚀 Firebase Hosting Deployment

WaitingRoom is deployed via **Firebase Hosting** at:
👉 **`https://waitingroom-eb72a.web.app`**

### Prerequisites

```bash
# Firebase CLI v15+ required (already installed if you followed setup)
npm install -g firebase-tools
firebase --version   # Should print 15.x.x
```

### Manual Deploy

```bash
# One-time browser login
firebase login

# Deploy to production
npm run deploy
# equivalent to: firebase deploy --only hosting
```

### Auto-Deploy (GitHub Actions)

Every push to `main` or `master` automatically deploys after all tests pass.

**Required secret** — add once in your GitHub repo (Settings → Secrets → Actions):

| Secret Name | Value |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT_WAITINGROOM_EB72A` | Contents of a Firebase Service Account JSON key |

> Generate the key: [Firebase Console → Project Settings → Service Accounts → Generate new private key](https://console.firebase.google.com/project/waitingroom-eb72a/settings/serviceaccounts/adminsdk)

---

## 📚 Comprehensive Documentation

Detailed design specifications and architectural documents are available in the [`docs/`](docs/) directory:

- 📐 **[System Architecture & Data Flow](docs/ARCHITECTURE.md)**
- 🧮 **[Blocking Impact Score Engine Formula & Tiers](docs/SCORING_ENGINE.md)**
- 🧭 **[Follow-Up Recommendation Policy Specification](docs/RECOMMENDATION_ENGINE.md)**
- 🔑 **[Authentication & Firebase Console Setup Guide](docs/AUTHENTICATION_AND_FIREBASE.md)**
- 🗄️ **[Data Schema & Storage Specification](docs/API_AND_STORAGE_SPEC.md)**
- 📖 **[Complete User Guide & 32-Screen Feature Index](docs/USER_GUIDE.md)**

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
