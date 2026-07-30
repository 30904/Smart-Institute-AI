# Smart Institute AI

Standalone institution management platform extracted from the Celeris ERP **WTI Institution** module.

**Team:** Arnav + Precious  
**Project lead:** Heramb  
**Reference UI:** [Celeris ERP — WTI](https://erp.smart-aiapps.com/app/wti/dashboard)

## Modules

| Module | Owner |
|--------|-------|
| Admissions, Students, Fees, Dashboard, Auth, Shared Masters | Arnav (`coreRoutes`) |
| Faculty, Academics, LMS, Exams | Precious (`academicRoutes`) |

Implementation tasks and ownership are tracked in `Smart_Institute_AI_Implementation_Tracker.xlsx`.

---

## Git repository

**Remote:** [github.com/celerisventures/Smart_Institution_ERP](https://github.com/celerisventures/Smart_Institution_ERP)

| Branch | Purpose |
|--------|---------|
| `main` | Stable / merged code (default) |
| `dev-arnav` | Arnav's working branch (`coreRoutes` modules) |
| `dev-precious` | Precious's working branch (`academicRoutes` modules) |

### Clone and pick your branch

```bash
git clone https://github.com/celerisventures/Smart_Institution_ERP.git
cd Smart_Institution_ERP

# Arnav
git checkout dev-arnav

# Precious
git checkout dev-precious
```

### Workflow

1. Do daily work on **your own dev branch** (`dev-arnav` or `dev-precious`).
2. Pull latest `main` regularly and merge/rebase into your branch to stay in sync.
3. Open a **Pull Request → `main`** when a tracker phase or feature slice is ready.
4. Do **not** push directly to `main` unless Heramb agrees.
5. Never edit the other dev's route aggregator (`coreRoutes` vs `academicRoutes`).

---

## Database setup

### Local MongoDB (use this for now)

Heramb will provide a shared MongoDB URI later. Until then, run **MongoDB locally** on your machine.

1. Install [MongoDB Community Server](https://www.mongodb.com/try/download/community) or run MongoDB via Docker.
2. Copy `.env.example` to `.env` (create `.env.example` from Phase 0 scaffold if not present yet).
3. Use the **same database name on both machines** so seed scripts behave the same:

```env
MONGO_URI=mongodb://127.0.0.1:27017/smart_institute_ai
```

4. Start the backend — it should connect to your local `smart_institute_ai` database.

> **Do not commit `.env`** — it may contain secrets. Only commit `.env.example` with placeholders.

### Seed data (after clone)

After pulling the repo and setting up `.env`, run the seed script (once Phase 0 scaffold is in place):

```bash
cd backend
npm run seed
```

Seeds create:

- Admin user and default login credentials (documented in seed output / `.env.example`)
- Roles and permissions (RBAC)
- Sample institution, academic years, departments, and programs
- Sample admissions masters (cycles, categories, intake, eligibility, documents, fee mappings, scholarships, statuses)
- Demo admission transactions (applications across every workflow status, uploaded documents, merit lists, seat allocations, fee confirmations, enrolled students) so Transactions, Reports, and Dashboard render with data

Demo applicants use the `@demo.smartinstitute.test` email domain. Re-running the seed replaces only those rows, so anything created through the UI is left untouched.

Precious should run seeds locally after clone so she has the same baseline data as Arnav.

### Shared dev database (later)

When Heramb shares the team MongoDB URI:

1. **One person** runs the seed script **once** on that cluster.
2. Both developers update `.env`:

```env
MONGO_URI=<uri-from-heramb>
```

3. No application code changes are required — only the `MONGO_URI` value changes.

---

## Development notes

- **Phase 0** (scaffold, shell, RBAC, login, shared masters) must be merged before feature branches.
- Route aggregators: `coreRoutes` (Arnav) and `academicRoutes` (Precious) — do not edit the other dev's route file.
- Cross-module events (`admission.enrolled`, `fee.paid`, etc.) are documented in `docs/contracts.md` once created.

---

## Getting started

> Steps below apply once the Phase 0 scaffold is implemented.

```bash
# Backend
cd backend
npm install
cp .env.example .env   # set MONGO_URI locally
npm run seed
npm run dev

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```
