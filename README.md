# Merchant Growth AI (VANIK) 🚀

> **AI-Powered Merchant Intelligence, Telemetry & POS Platform**  
> Turning transaction & Soundbox telemetry into actionable, explainable growth decisions and real-time billing for Indian merchants.

---

## 1. Executive Summary & Problem Statement

Millions of small and medium merchants across India rely on daily digital payments via **Paytm QR codes, Soundboxes, and Card POS terminals**. However, raw transaction volume numbers do not tell a merchant **why** sales surged or dipped, **which** customers are slipping away, or **what exact business move** they should execute to grow profits.

**Merchant Growth AI (VANIK)** bridges this gap. It continuously digests transaction telemetry, uncovers root causes behind revenue leaks (e.g. *"Evening footfall collapsed 31% due to 312 dormant regulars"*), simulates microeconomic business interventions (e.g. *₹49 Evening Combo*), recommends high-ROI moves with 1-click launch, monitors closed-loop campaign results, and provides a **full Point-of-Sale (POS) terminal with Soundbox audio and Voice AI assistance**.

---

## 2. What's New: Recent Platform Features & Upgrades ✨

### 🧠 1. VANIK Memory: Cognee Knowledge Graph & Episodic Engine (`/memory`)
- **Explainable Merchant Memory**: Integrates **Cognee** (open-source AI memory framework) to build an explainable, multi-tenant knowledge graph per merchant connecting `Merchant → Product → Time Slot → Customer Segment → Campaign → Outcome`.
- **Source Provenance Guarantee**: Every memory-backed answer returns its source nodes and provenance ("Why am I saying this?"), strictly citing figures computed by the ML layer without AI hallucinations.
- **Interactive Knowledge Graph Canvas**: Recharts-independent pure SVG radial & topological graph visualizer with zoom, pan, entity filtering (`Product`, `Time Slot`, `Segment`, `Campaign`, `Insight`), and an interactive Node Inspector panel.
- **Sidebar Memory Glimpse**: Animated mini-graph SVG thumbnail with live counters (1,284 memories, 412 connections) and rotating historical insights with hover provenance.
- **Ask Memory with Voice**: Voice-enabled query box with speech-to-text input (`VoiceInputButton`) and spoken answer readout (`VoiceReadoutButton`).
- **Episodic Event Streaming**: Non-blocking asynchronous event capture on bill creation (`BILL_COMPLETED`) and campaign launches/outcomes (`CAMPAIGN_LAUNCHED`, `CAMPAIGN_RESULT`).
- **Graceful Offline Fallback**: Degrades seamlessly to cached graph topology when backend or AI service is offline with banner *"Memory offline – showing cached insights"*.

### 🧾 2. Real-Time POS Billing & Thermal Invoice Generator (`/billing`)
- **Quick-Add POS Terminal**: Rapid item catalog with Indian merchant presets (Special Masala Chai, Bun Maska Toast, Samosa, Deluxe Thali, Paneer Butter Masala) plus custom menu item creation.
- **Cart & Order Customization**: Live quantity controls, Dine-in / Takeaway / Delivery / Express POS order types, table numbers, customer phone & name tagging.
- **Omni-Channel Payments**: 
  - Dynamic **UPI QR Code** generation for real-time mobile scanning.
  - **Paytm Card POS Terminal** integration simulation.
  - **Cash** mode with an instant balance & change calculator.
- **Soundbox Voice Announcement Simulator**: Speaks the iconic soundbox confirmation (*"Paytm par ₹[amount] prapt hue"*) via live Web Speech audio synthesis.
- **Printable Thermal Receipt**: Generates formatted 80mm receipts with QR verification codes, tax/GST breakdown, and 1-click print modal.
- **Instant Bi-Directional Ledger Sync**: Every billed order is instantly recorded in the local dataset and posted to the Spring Boot `/api/transactions` endpoint, updating dashboard KPIs and transaction history in real time.

### 🎙️ 2. Full Voice Interaction Suite (STT & TTS)
- **Speech-to-Text (`VoiceInputButton`)**:
  - Voice-enabled **Global Search** in the Topbar.
  - Voice-enabled **Transaction Ledger Search** to look up customers or receipt IDs hands-free.
  - Voice-dictated queries in **VANIK Saathi AI Copilot**.
  - Animated acoustic ring pulses with browser Web Speech Recognition fallback.
- **Text-to-Speech (`VoiceReadoutButton`)**:
  - Integrated into **AI Copilot chat messages**.
  - Merchants can tap the speaker icon to listen to AI root-cause diagnoses and growth recommendations read aloud in natural spoken audio.

### ⚡ 3. Java Spring Boot Transaction REST API
- **New Transaction Controller**: `POST /api/transactions` and `POST /api/v1/transactions` for idempotent bill recording.
- **Idempotency & Safety**: Prevents duplicate entries using bill/receipt IDs and ensures deterministic database writes.
- **Automated Channel Mapping**: Maps payment methods to channels (`SOUNDBOX`, `OFFLINE_STORE`, `POS_TERMINAL`) with Soundbox announcement status flags.

### 📊 4. 399-Row Benchmark Dataset & SQL Migration Engine
- **Authentic Telemetry**: Embedded 399-row merchant transaction dataset (`user_transactions.json` and `user_transactions_schema_data.sql`).
- **Dynamic Timeframe Engine**: Instant financial KPI calculation across **Day, Month, and Year** timeframes with automatic month/day trend clustering and category attribution (Food, Rent, Misc, Bills, Transport, Salary).

### 🌐 5. Multilingual Localization (English, Hindi, Punjabi)
- First-class regional language support for Indian merchants:
  - **English**
  - **Hindi (हिंदी)**
  - **Punjabi (ਪੰਜਾਬੀ)**
- Instant language switcher in Settings and Topbar with persistent preferences.

### 🌓 6. High-Contrast Dark & Light Mode
- Complete theme support tailored for high sunlight visibility in physical shops as well as low-light evening environments.
- **Sliding Sun & Half-Moon animated theme switcher** in the Topbar with persistent `localStorage` preference.

### 🔐 7. Dedicated Authentication Flow
- Paytm-styled **Sign In (`/login`)** and **Sign Up (`/signup`)** pages integrated with **Supabase Authenticator**.
- Session state management, secure routing, and a clean **Sign-Out confirmation modal window**.

---

## 3. Core Product Flow

```
Merchant Data (Soundbox, QR & POS Stream)
       ↓
    Analyze (Revenue, ticket size, hourly heatmaps, RFM cohorts)
       ↓
   Find Why (Root-cause tree: 31% evening drop → 14% repeat customer slip)
       ↓
Identify Growth Opportunities (Re-activating 312 dormant regulars)
       ↓
What-If Simulation (Interactive levers: discount, duration, target count, net gain)
       ↓
Personalized Recommendation (AI selects ₹49 Evening Combo, 9.6x ROI)
       ↓
Measure Results (Before vs After telemetry: ₹2.84L → ₹3.21L)
       ↓
Continuous Improvement (AI Learning: Evening response strong; test weekend platter next)
```

---

## 4. Platform Architecture

```
┌────────────────────────────────────────────────────────────┐
│          Frontend (Next.js 14 App Router + React 18)       │
│  Tailwind CSS, Recharts, Web Speech STT/TTS, POS Terminal  │
│  Routes: /billing, /transactions, /memory, /copilot...     │
│  Sidebar: "NEW" Memory Nav + Live Graph Glimpse Card       │
└─────────────────────────────┬──────────────────────────────┘
                              │ HTTP / JSON REST
                              ▼
┌────────────────────────────────────────────────────────────┐
│             Backend (Java 21 + Spring Boot 3)              │
│  Spring Data JPA, WebClient, MemoryController, Auth        │
│  Endpoints: /api/transactions, /api/memory, /api/ai...     │
└──────────────┬──────────────────────────────┬──────────────┘
               │                              │
       Reactive WebClient                     │ JPA / SQL
               │                              ▼
               ▼               ┌─────────────────────────────┐
┌────────────────────────────┐ │   Database (PostgreSQL /    │
│  AI Service (Python 3.10+  │ │          Supabase)          │
│        + FastAPI)          │ │  Merchants, Customers,      │
├────────────────────────────┤ │  Transactions, 399-Row Seed │
│ ML Layer (Pandas / Sklearn)│ └─────────────────────────────┘
│ - RFM Segmentation         │                ▲
│ - Slump / Anomaly Detector │                │
│ - Microeconomic Simulator  │                │ Webhooks &
├────────────────────────────┤                │ Orchestration
│ 🧠 Cognee Memory Engine    │                ▼
│ - Knowledge Graph (Nodes)  │ ┌─────────────────────────────┐
│ - Episodic Recall & Sources│ │     n8n Workflow Layer      │
├────────────────────────────┤ │  - Hourly Slump Monitor     │
│ LLM Layer (OpenAI JSON)    │ │  - Campaign Execution Hook  │
│ - Grounded Copilot Chat    │ │  - Closed-Loop Evaluator    │
│ - Root-Cause Narratives    │ │  - Nightly Memory Sync      │
└────────────────────────────┘ └─────────────────────────────┘
```

---

## 5. Key Engineering Principles & Data Rules

### 5.1 Strict Separation of ML & LLM
- **Machine Learning (Python / Pandas / Scikit-learn)** computes all **ground truth numerical metrics**:
  - Exact drop percentages (e.g. -31.0% between 5:00 PM and 8:30 PM).
  - RFM customer cohort counts (245 Loyal, 380 Regular, 147 At-Risk, 312 Inactive, 164 New).
  - Elasticity calculations, estimated campaign costs, and net gains.
- **Large Language Model (OpenAI API via structured JSON)** is strictly restricted to **narrative translation and merchant conversational assistance**.
- The LLM **never invents, alters, or hallucinates financial or analytical numbers**.

### 5.2 Realistic Telemetry & Data Compliance
- Operates on **realistic Indian merchant telemetry** matching authentic merchant profiles (tea stalls, sweet shops, cafes), realistic Indian Rupee price levels (₹20 to ₹500), masked phone numbers (`+91 98110 •••••`), and operational temporal patterns.
- The data models and REST endpoints are decoupled to allow direct drop-in integration with authorized Paytm Open APIs and Soundbox webhook streams.

---

## 6. Directory Structure

```
vanik/
├── frontend/                     # Next.js 14 App Router + React 18 + Tailwind
│   ├── app/                      # Next.js App Router Pages
│   │   ├── page.tsx              # Executive Merchant Dashboard
│   │   ├── billing/              # Real-Time POS Billing & Invoice Generator
│   │   ├── transactions/         # Live Ledger with Voice Search & Dynamic Filters
│   │   ├── analytics/            # Deep-dive charts & product telemetry
│   │   ├── insights/             # Root-Cause "WHY?" Engine
│   │   ├── simulator/            # Interactive What-If Elasticity Simulator
│   │   ├── recommendations/      # AI-Ranked Growth Recommendations
│   │   ├── campaigns/            # Live Campaign Monitoring & Telemetry
│   │   ├── customers/            # RFM Cohort Segmentation
│   │   ├── memory/               # 🧠 Flagship VANIK Memory Graph Canvas & Timeline
│   │   ├── copilot/              # VANIK Saathi AI Copilot with Voice STT/TTS & Memory Citations
│   │   ├── npci/                 # Macro NPCI & UPI Ecosystem Trends
│   │   ├── settings/             # Language & Merchant Profile Settings
│   │   ├── login/                # Paytm-styled Login with Supabase
│   │   └── signup/               # Merchant Account Registration
│   ├── components/               # Modular UI Components
│   │   ├── copilot/              # ChatWindow, ChatMessage (with TTS Readout & Memory chips)
│   │   ├── memory/               # MemoryGraphCanvas (interactive SVG graph)
│   │   ├── layout/               # Sidebar (NEW badge & Memory Glimpse card), Topbar
│   │   └── ui/                   # VoiceInputButton, VoiceReadoutButton, Modals, Badges
│   ├── lib/                      # Core business logic & dataset helpers
│   │   ├── api.ts                # REST API client with offline fallback & memory client
│   │   ├── memory-mock.ts        # Offline fallback graph nodes, edges & timeline
│   │   ├── user-dataset.ts       # Dynamic 399-row dataset aggregation engine
│   │   ├── user_transactions.json# Real transaction dataset
│   │   └── theme.tsx             # Global light/dark theme context
│   ├── package.json
│   └── tailwind.config.ts
│
├── backend/                      # Java 21 + Spring Boot 3 REST API Service
│   ├── src/main/java/com/merchantgrowth/
│   │   ├── MerchantGrowthApplication.java
│   │   ├── controller/           # TransactionController, MemoryController, Analytics, Ai
│   │   ├── dto/                  # CreateTransactionDto, MemoryDto, ChatMessageDto
│   │   ├── entity/               # TransactionEntity, Merchant, Customer
│   │   ├── repository/           # TransactionRepository (Spring Data JPA)
│   │   ├── service/              # TransactionService, MemoryService, DataInitializerService
│   │   └── config/               # CorsConfig, WebClientConfig
│   ├── src/main/resources/
│   │   └── application.yml       # In-memory H2 & Supabase/PostgreSQL profiles
│   ├── pom.xml
│   └── Dockerfile
│
├── ai-service/                   # Python 3 + FastAPI ML & Cognee Memory Microservice
│   ├── app/
│   │   ├── main.py               # FastAPI entrypoint (Port 8000)
│   │   ├── api/
│   │   │   ├── routes.py         # Root router
│   │   │   └── memory_routes.py  # /memory/ingest, /event, /recall, /graph, /stats
│   │   ├── schemas/              # Pydantic request/response schemas (memory.py, copilot.py)
│   │   ├── memory/
│   │   │   └── cognee_memory.py  # Cognee Knowledge Graph Engine & Episodic Recall
│   │   ├── ml/
│   │   │   ├── segmentation.py   # RFM clustering model
│   │   │   ├── anomaly.py        # 5-8 PM slump detector
│   │   │   └── simulator.py      # What-If elasticity math
│   │   └── llm/
│   │       └── copilot.py        # Memory-grounded AI Growth Copilot reasoning
│   ├── requirements.txt          # includes cognee
│   └── Dockerfile
│
├── database/                     # PostgreSQL / Supabase Migrations & Seeds
│   ├── user_transactions_schema_data.sql # 399-row dataset DDL + INSERTs
│   ├── schema.sql                # Complete platform DDL schema
│   ├── seed_data.sql             # Benchmark seed dataset
│   └── seed_synthetic_data.py    # Synthetic telemetry generator
│
├── n8n/                          # n8n Workflow Automation Layer
│   └── workflows/
│       ├── slump_detector.json   # 5-8 PM slump alert
│       ├── campaign_runner.json  # Auto-execution webhook
│       └── memory_sync.json      # Nightly merchant memory ingestion & closed-loop sync
│
├── docker-compose.yml            # Multi-service orchestration + cognee_data volume
└── README.md                     # Master documentation
```

---

## 7. How to Run Each Service

### Prerequisites
- **Node.js v20+** & **npm**
- **Java 21** + **Maven 3.9+**
- **Python 3.10+**
- (Optional) **Docker** & **Docker Compose**

---

### ⚡ Quick Start: One Command (Recommended)
You can launch both the **FastAPI AI & Cognee Service** and the **Next.js Frontend** simultaneously in a single terminal:

```bash
# In the repository root directory (d:\vanik\vanik):
npm run dev
# OR:
.\start-all.bat
# OR in PowerShell:
.\start-all.ps1
```
*Starts Frontend on `http://localhost:3000` and AI Service on `http://localhost:8000` with unified, colored logs.*

---

### Step 1: Start Next.js Frontend Individually
```bash
cd frontend
npm install
npm run dev
```
*Runs on `http://localhost:3000`. Connects to Spring Boot backend at `http://localhost:8080` (or falls back seamlessly to the local dataset engine if the backend is offline).*

---

### Step 2: Start Java Spring Boot Backend
```bash
cd backend
mvn clean spring-boot:run
```
*Runs on `http://localhost:8080`. Automatically boots H2 database (or PostgreSQL if configured) with pre-seeded merchant accounts and exposes `/api/transactions`.*

---

### Step 3: Start Python FastAPI AI/ML & Cognee Service
```bash
cd ai-service
pip install -r requirements.txt
# Set optional Cognee / LLM environment variables (defaults to offline/local storage if unset)
# Windows PowerShell:
$env:LLM_API_KEY="your-key-here"
$env:COGNEE_STORAGE_DIR="./cognee_data"
# Or bash:
# export LLM_API_KEY="your-key-here"
# export COGNEE_STORAGE_DIR="./cognee_data"
uvicorn app.main:app --port 8000 --reload
```
*Runs on `http://localhost:8000`. Swagger API docs available at `http://localhost:8000/docs`. Pre-seeds and serves Cognee Knowledge Graph endpoints at `/memory/*` and `/ai/memory/*`.*

---

### Step 4 (Optional): Database Migrations (Supabase / PostgreSQL)
To load the benchmark 399-row dataset directly into your PostgreSQL or Supabase instance:
```bash
psql -h <host> -U <user> -d <dbname> -f database/user_transactions_schema_data.sql
```

---

### Step 5 (Alternative): Run Entire Suite with Docker
```bash
docker-compose up --build
```
*Persistent volume `cognee_data` automatically mounts to `/app/cognee_data` inside `ai-service` to preserve knowledge graph memory across restarts.*

---

## 8. Guided Platform Walkthrough

1. **Sign In / Registration**: Navigate to `/login` or `/signup` to authenticate using the Paytm-styled Supabase interface.
2. **Dashboard Overview**: View live revenue, transaction volume, avg ticket size, repeat customer trends, and hourly heatmaps. Switch timeframes (Day / Month / Year) to observe dynamic KPI re-calculations.
3. **Voice Search**: Click the microphone icon in the Topbar or Transactions page to search records hands-free.
4. **Interactive POS Billing (`/billing`)**:
   - Add items from the quick menu (e.g. Masala Chai, Samosa, Deluxe Thali).
   - Enter customer name and phone.
   - Click **Generate UPI QR** to preview a live payment QR code or choose **Cash / POS Card**.
   - Click **Complete Payment** to hear the authentic **Paytm Soundbox voice announcement**.
   - Preview and print the 80mm thermal receipt.
   - Check `/transactions` to verify that the newly generated bill is immediately at the top of the live ledger.
   - *Behind the scenes, the backend asynchronously registers a `BILL_COMPLETED` memory event with Cognee.*
5. **🧠 VANIK Memory Knowledge Graph (`/memory`)**:
   - Look at the sidebar **Memory Glimpse** card: inspect live node counters, connection statistics, and rotating merchant memory summaries.
   - Click the card or the **Memory** nav item (highlighted with an animated **NEW** badge) to open `/memory`.
   - Explore the interactive **Knowledge Graph Canvas**: click any node (Product, Time Slot, Segment, Campaign, Insight) to open the side panel and inspect connected business facts.
   - Use the **Ask Memory** voice/text bar: ask *"What worked last time I ran an evening offer?"* or *"Which customer segments respond best to combos?"* and see citations with source chips.
   - Review the chronological **Memory Timeline** tracking billings, campaign activations, and cohort migrations.
   - Click **Sync Now** to trigger an on-demand snapshot ingestion.
6. **AI Root-Cause "Why?" Engine (`/insights`)**: Follow the interactive decision tree to uncover why evening footfall dropped 31%.
7. **What-If Simulator (`/simulator`)**: Adjust campaign discount levers, duration, and audience to forecast net revenue uplifts.
8. **Launch AI Recommendations (`/recommendations`)**: Review AI-scored initiatives (e.g. ₹49 Evening Combo) and click **Approve & Launch**. *Asynchronously registers a `CAMPAIGN_LAUNCHED` event in Cognee.*
9. **Talk to VANIK Saathi AI Copilot (`/copilot`)**:
   - Speak your questions using the microphone button.
   - Observe how the Copilot grounds answers using Cognee memory, rendering a **🧠 Used memory** chip that links directly to source nodes in `/memory`.
   - Click the audio speaker button on any AI message to hear the advice read aloud.
10. **Language & Theme Customization**: Switch between **English, Hindi, and Punjabi** in Settings, and toggle **Dark / Light Mode** using the sliding Sun & Moon button in the top bar. All Memory pages, badges, and cards dynamically adapt.

---

## 9. License & Attribution
Developed for the **Paytm Merchant Intelligence Hackathon**. Built with Next.js, Spring Boot, FastAPI, and Tailwind CSS. All merchant data is realistically synthesized for Indian retail and QSR operations.
