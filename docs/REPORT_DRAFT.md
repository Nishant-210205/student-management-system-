# Project Technical Report • Three-Tier Student Management System

**Author:** Saim Niyazi (co2023smniyazi)  
**Repository:** [github.com/co2023smniyazi/three-tier-student-management-system](https://github.com/co2023smniyazi/three-tier-student-management-system)  
**Branch:** `ui-polish`  
**License:** MIT  
**Budget:** ₹0 / $0 (100% Free-Tier & Open Source)  

---

## 1. System Overview

CampusConnect is a production-grade, three-tier Student Information System integrated with Model Context Protocol (MCP) tooling for AI-assisted operations. The architecture strictly separates presentation, application logic, persistence, and external protocol interfaces.

```
┌────────────────────────────────────────────────────────┐
│                   TIER 1: PRESENTATION                 │
│         React 18 + Vite SPA (Hosted on Vercel)         │
│  • Dark / Light Theme System  • Debounced Search Engine │
│  • Real-time Analytics Cards  • RFC 4180 CSV Exporter  │
│  • Accessible Dialogs & Modals• Render Cold-Start Alert│
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP / JSON
                           ▼
┌────────────────────────────────────────────────────────┐
│                   TIER 2: APPLICATION                  │
│       Node.js + Express REST API (Hosted on Render)    │
│  • Helmet Security Headers   • IP Rate Limiter (120/m) │
│  • CORS Strict Allowlist     • Switchable Write Auth   │
│  • Mongoose ODM Service Layer• Concurrency Singletons  │
└──────────────┬───────────────────────────▲─────────────┘
               │ MongoDB Wire Protocol     │ HTTP / JSON
               ▼                           │
┌──────────────────────────────┐ ┌─────────┴─────────────┐
│       TIER 3: DATABASE       │ │        AI LAYER       │
│      MongoDB Atlas M0        │ │   Claude Desktop MCP  │
│  • High-Availability Replica │ │ • Model Context Proto │
│  • Schema-Level Validations  │ │ • 5 Managed DB Tools  │
│  • Unique Indexed studentId  │ │ • Bidirectional Sync  │
└──────────────────────────────┘ └───────────────────────┘
```

---

## 2. Tier-by-Tier Implementation Details

### Tier 1: Presentation Layer (Client)
- **Framework:** React 18 with Vite build bundler.
- **Hosting:** Vercel Edge Network.
- **Design System:** Custom CSS design system with CSS custom properties (`:root` and `[data-theme='dark']`), zero heavyweight third-party CSS frameworks, resulting in a lean 185 kB JavaScript and 20 kB CSS bundle.
- **Key Features:**
  - **Cold-Start Awareness:** When Render free-tier instances sleep (after 15 minutes of inactivity), the client detects requests exceeding 3.5 seconds and renders a friendly "Server is waking up" indicator.
  - **Dynamic Analytics:** Real-time calculation of total students, department counts, average semester, and visual department distribution bars.
  - **Data Export:** RFC 4180-compliant browser-side CSV export with quote escaping.
  - **Accessibility (a11y):** Keyboard navigation (ESC key dismissal, Tab focus trapping, auto-focus), ARIA dialog attributes, and focus rings.

### Tier 2: Application Layer (Server)
- **Runtime:** Node.js 20 with Express 4.
- **Hosting:** Render Web Service (Free Tier).
- **Security Posture:**
  - `helmet`: Sets HTTP defense headers (`X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, `X-Frame-Options`).
  - `express-rate-limit`: Protects against brute-force and DoS attacks by restricting IPs to 120 requests/minute.
  - `cors`: Validates incoming requests against an allowlist containing local development ports and Vercel domains (`.vercel.app`).
  - **Switchable Authentication (`AUTH_ENABLED`):** Defaults to `false` for open portfolio evaluation without requiring login gates; when toggled to `true`, enforces Bearer token validation for write mutations.
- **Database Connection Management:**
  - Implements an idempotent connection singleton with in-flight Promise caching to prevent race conditions during rapid concurrent requests.

### Tier 3: Data Persistence Layer (Database)
- **Engine:** MongoDB Atlas M0 Free Tier (AWS us-east-1).
- **Database:** `studentDB` with `students` collection.
- **Schema Constraints:**
  - `studentId`: Unique index, string, trimmed.
  - `name`: String, required, trimmed.
  - `email`: String, required, regex validated (`/^\S+@\S+\.\S+$/`), lowercase.
  - `department`: String, required.
  - `semester`: String, required.
  - `contact`: String, required.
  - `timestamps`: `createdAt` and `updatedAt` managed automatically.

### AI Integration Layer: Model Context Protocol (MCP)
- **Protocol:** Anthropic Model Context Protocol (`@modelcontextprotocol/sdk`).
- **Client:** Claude Desktop.
- **Exposed Tools:**
  1. `list_students(search)`: Returns live student records matching optional query.
  2. `get_student(id)`: Fetches a single record by MongoDB `_id` or `studentId`.
  3. `create_student(data)`: Enrolls a new student with strict Zod schema validation.
  4. `update_student(id, data)`: Updates student details.
  5. `delete_student(id)`: Permanently deletes a student record.
- **Data Parity:** Any operation executed by Claude Desktop in natural language is reflected immediately on the web application.

---

## 3. Automated Testing & Verification

The project includes an automated test harness executed using Node.js's native test runner (`node:test`):

```bash
npm test
```

### Test Results Summary:
- **Total Test Cases:** 25 passing (15 backend/security tests + 10 MCP tests).
- **Failures:** 0.
- **Execution Time:** ~5.5 seconds.
- **Tested Subsystems:**
  - Payload input validation (boundary cases, regex failures, missing fields).
  - REST route dispatching (200, 201, 400, 404, 503).
  - CORS allowlist validation for localhost and Vercel domains.
  - Helmet security header injection.
  - Switchable authentication (401 on missing token, 403 on invalid token, 200 on valid token).
  - Connection concurrency guard (promise reuse).
  - MCP tool discovery (`listTools`) and execution (`list_students`, `get_student`, `create_student`, `update_student`, `delete_student`).
  - Bidirectional data synchronization between REST and MCP.

---

## 4. Free-Tier Operational Profile & Constraints

| Service | Tier | Verified Limits | Handling Strategy |
| :--- | :--- | :--- | :--- |
| **Vercel** | Hobby (Free) | 100 GB bandwidth / mo | Static SPA caching at edge. |
| **Render** | Free Web Service | 512 MB RAM, spins down after 15 min idle | Client detects cold-start latency (>3.5s) and displays explanatory notification. |
| **MongoDB Atlas** | M0 Free Cluster | 512 MB storage, shared RAM | Efficient document schema, indexing on `studentId`, zero drop/overwrite policies. |
| **Claude Desktop** | Desktop App | Local stdio transport | Local execution of Node MCP server with zero external hosting costs. |

---

## 5. Conclusion & Recommendations

CampusConnect demonstrates that a modern, multi-tier web application can achieve production reliability, robust security controls, automated test coverage, and cutting-edge AI interoperability without incurring hosting expenses.

Recommended next steps for production expansion:
1. Enable `AUTH_ENABLED=true` in enterprise environments with role-based access control (RBAC).
2. Attach a custom domain on Vercel with automatic TLS renewal.
3. Configure continuous monitoring alerts on Render health check endpoints.

