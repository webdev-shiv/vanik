# Merchant Growth AI 🚀

> **AI-Powered Merchant Intelligence Platform**  
> Turning transaction & Soundbox telemetry into actionable, explainable growth decisions for Indian merchants.

---

## 1. Executive Summary & Problem Statement

Millions of small and medium merchants across India rely on daily digital payments via **Paytm QR codes, Soundboxes, and Card POS terminals**. However, raw transaction volume numbers do not tell a merchant **why** sales surged or dipped, **which** customers are slipping away, or **what exact business move** they should execute to grow profits.

**Merchant Growth AI** closes this gap. It continuously digests transaction telemetry, uncovers root causes behind revenue leaks (e.g. *"Evening footfall collapsed 31% due to 312 dormant regulars"*), simulates microeconomic business interventions (e.g. *₹49 Evening Combo*), recommends high-ROI moves with 1-click launch, and monitors closed-loop campaign results.

---

## 2. Core Product Flow

```
Merchant Data (Soundbox & QR stream)
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

## 3. Platform Architecture

```
┌────────────────────────────────────────────────────────────┐
│              Frontend (React 19 + TypeScript)              │
│       Vite, Tailwind CSS, Recharts, 12-Step Demo Tour      │
└─────────────────────────────┬──────────────────────────────┘
                              │ HTTP / JSON REST
                              ▼
┌────────────────────────────────────────────────────────────┐
│             Backend (Java 21 + Spring Boot 3)              │
│      Spring Data JPA, WebClient, Resilient Circuit Logic   │
└──────────────┬──────────────────────────────┬──────────────┘
               │                              │
       Reactive WebClient                     │ JPA / SQL
               │                              ▼
               ▼               ┌─────────────────────────────┐
┌────────────────────────────┐ │   Database (PostgreSQL /    │
│  AI Service (Python 3.14   │ │          Supabase)          │
│        + FastAPI)          │ │  Merchants, Customers,      │
├────────────────────────────┤ │  Transactions, Campaigns    │
│ ML Layer (Pandas / Sklearn)│ └─────────────────────────────┘
│ - RFM Segmentation         │                ▲
│ - Slump / Anomaly Detector │                │
│ - Microeconomic Simulator  │                │ Webhooks &
├────────────────────────────┤                │ Orchestration
│ LLM Layer (OpenAI JSON)    │                ▼
│ - Root-Cause Narratives    │ ┌─────────────────────────────┐
│ - AI Growth Copilot Chat   │ │     n8n Workflow Layer      │
└────────────────────────────┘ │  - Hourly Slump Monitor     │
                               │  - Campaign Execution Hook  │
                               │  - Closed-Loop Evaluator    │
                               └─────────────────────────────┘
```

---

## 4. Key Engineering Principles & Data Rules

### 4.1 Strict Separation of ML & LLM
- **Machine Learning (Python / Pandas / Scikit-learn)** computes all **ground truth numerical metrics**:
  - Exact drop percentages (e.g. -31.0% between 5:00 PM and 8:30 PM).
  - RFM customer cohort counts (245 Loyal, 380 Regular, 147 At-Risk, 312 Inactive, 164 New).
  - Elasticity calculations, estimated campaign costs, and net gains.
- **Large Language Model (OpenAI API via structured JSON)** is strictly restricted to **narrative translation and merchant conversational assistance**.
- The LLM **never invents, alters, or hallucinates financial or analytical numbers**.

### 4.2 Important Data Compliance Rule
- We do **not** have or claim access to private Paytm merchant transaction records for this prototype.
- The platform operates on **realistic synthetic Indian merchant telemetry** matching authentic Indian merchant profiles (tea stalls, sweet shops, cafes), realistic Indian Rupee price levels (₹20 to ₹500), masked phone numbers (`+91 98110 •••••`), and operational temporal patterns.
- The data models and REST endpoints are decoupled to allow direct drop-in integration with authorized Paytm Open APIs and Soundbox webhook streams in the future.

---

## 5. Directory Structure

```
paytm_hack/complete/
├── frontend/                     # React + TypeScript + Vite + Tailwind + Recharts
│   ├── src/
│   │   ├── components/           # Navbar, Sidebar, TourBanner, Charts, Cards
│   │   ├── context/              # AppContext & DemoTour state machine
│   │   ├── pages/                # 11 Platform Pages (Dashboard, Why, Simulator, etc.)
│   │   ├── services/             # API client with dual Spring Boot / fallback mode
│   │   └── types/                # Canonical TypeScript domain interfaces
│   ├── package.json
│   ├── Dockerfile
│   └── vite.config.ts
│
├── backend/                      # Java 21 + Spring Boot 3 REST API Service
│   ├── src/main/java/com/merchantgrowth/
│   │   ├── MerchantGrowthApplication.java
│   │   ├── config/               # CorsConfig, WebClientConfig
│   │   ├── controller/           # Merchant, Analytics, Ai, Campaign, Customer
│   │   ├── dto/                  # ApiResponse<T>, DTOs
│   │   ├── entity/               # Merchant, Customer, Transaction, Campaign JPA Entities
│   │   ├── repository/           # Spring Data JPA Repositories
│   │   └── service/              # Business services & DataInitializerService
│   ├── src/main/resources/
│   │   └── application.yml       # H2 in-memory & PostgreSQL/Supabase profile
│   ├── pom.xml
│   └── Dockerfile
│
├── ai-service/                   # Python 3 + FastAPI ML & LLM Microservice
│   ├── app/
│   │   ├── main.py               # FastAPI entrypoint (Port 8000)
│   │   ├── schemas.py            # Pydantic request/response schemas
│   │   ├── ml/
│   │   │   ├── segmentation.py   # RFM clustering model
│   │   │   ├── anomaly.py        # 5-8 PM slump detector
│   │   │   └── simulator.py      # What-If elasticity math
│   │   └── llm/
│   │       └── copilot.py        # Structured AI Growth Copilot reasoning
│   ├── requirements.txt
│   └── Dockerfile
│
├── database/                     # Supabase / PostgreSQL Migrations & Data Engine
│   ├── schema.sql                # Complete DDL schema
│   ├── seed_synthetic_data.py    # Realistic synthetic Indian merchant data generator
│   └── seed_data.sql             # Benchmark seed dataset
│
├── n8n/                          # n8n Workflow Automation Layer
│   ├── workflows/
│   │   ├── 01_hourly_slump_monitor.json
│   │   ├── 02_campaign_execution_trigger.json
│   │   └── 03_closed_loop_learning.json
│   └── README.md
│
├── docker-compose.yml            # Unified multi-service orchestration
└── README.md                     # Master documentation
```

---

## 6. How to Run Each Service

### Prerequisites
- **Java 21** + **Maven 3.9+**
- **Python 3.10+** (tested on Python 3.14)
- **Node.js v20+**

---

### Step 1: Database Setup
```bash
cd database
python seed_synthetic_data.py
```
*Generates fresh `seed_data.json` and `seed_data.sql` with 1,248 transactions totaling ₹2,84,500.*

---

### Step 2: Start Python FastAPI AI/ML Service
```bash
cd ai-service
pip install -r requirements.txt
uvicorn app.main:app --port 8000 --reload
```
*Runs on `http://localhost:8000`. OpenAPI docs available at `http://localhost:8000/docs`.*

---

### Step 3: Start Java Spring Boot Backend
```bash
cd backend
mvn clean spring-boot:run
```
*Runs on `http://localhost:8080`. Seeds in-memory database automatically with Sharma Tea Corner benchmark data.*

---

### Step 4: Start React Frontend
```bash
cd frontend
npm install
npm run dev
```
*Opens at `http://localhost:5173`. Connects to Spring Boot backend at `http://localhost:8080/api/v1`.*

---

### Alternative: Run Everything with Docker Compose
```bash
docker-compose up --build
```

---

## 7. 12-Step Guided Hackathon Demo Tour

The frontend includes a built-in **12-Step Guided Demo Flow** (accessible via the top banner on any page):

1. **Merchant Authentication**: 1-click login into Sharma Tea Corner (QSR, Connaught Place).
2. **Dashboard Baseline Alert**: High-level metrics surface: Gross revenue ₹2.84L, Repeat customers ↓ 14%, Sales slump alert.
3. **AI Root-Cause Trigger**: Click **[See Why]** to trace the root cause.
4. **Root-Cause "WHY?" Engine**: Interactive tree: Sales ↓ 11.4% $\rightarrow$ Evening txns ↓ 31% (62% contribution) $\rightarrow$ Inactive regulars (+312 dormant).
5. **Interactive What-If Simulator**: Experiment with offer discount (₹49), duration (7 days), and customer audience (312 regulars).
6. **AI Recommendation Selected**: AI scores and highlights the **₹49 Evening Combo** (+14.2% uplift, 9.6x ROI).
7. **Recommendations Hub**: Merchant reviews impact, budget cost (₹4,200), and priority badges.
8. **Merchant Approval & Launch**: Merchant clicks **[Approve & Launch]**. Confetti animation confirms deployment.
9. **Live Campaign Monitoring**: Campaign enters `RUNNING` status with live budget burn and soundbox telemetry.
10. **Campaign Performance Telemetry**: Post-campaign comparison: Expected impact (+25%) vs Actual impact (+27.2%). Revenue rose from ₹2.84L to ₹3.21L.
11. **AI Closed-Loop Learning**: AI analyzes hour-by-hour lift and recommends: *"Test Weekend Family Platter next"*.
12. **AI Growth Copilot**: Ask anything: *"Why are my sales down?"*, *"Which customers should I target?"* with 1-click navigation buttons.
