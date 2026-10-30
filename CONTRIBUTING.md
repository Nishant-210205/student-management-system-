# Contributing to CampusConnect

Thank you for your interest in contributing to the **CampusConnect Three-Tier Student Management System**!

## Code of Conduct

Please be respectful, collaborative, and considerate of other contributors.

---

## Development Setup

### 1. Prerequisites
- **Node.js**: v20 or higher
- **npm**: v10 or higher
- **MongoDB Atlas** account (or local MongoDB 6+)

### 2. Clone and Install
```bash
git clone https://github.com/co2023smniyazi/three-tier-student-management-system.git
cd three-tier-student-management-system
npm run setup
```

### 3. Environment Configuration
Copy each `.env.example` file to `.env`:
```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
cp mcp-server/.env.example mcp-server/.env
```
Fill in your credentials in `server/.env`. **Never commit `.env` files to git.**

---

## Running the Project

```bash
# Start backend server (port 5000)
npm run start:server

# Start frontend development server (port 5173)
npm run start:client

# Start local MCP server
npm run start:mcp
```

---

## Testing & Quality Assurance

Run the automated test suite before opening any pull request:

```bash
# Run all server and MCP tests
npm test

# Run MCP server tests only
npm run test:mcp

# Build the client bundle (Vite)
npm run build:client
```

---

## Branching & Pull Request Guidelines

1. Always branch off `main` (e.g. `feature/my-enhancement` or `fix/my-bugfix`).
2. Never push directly to `main`.
3. Keep changes focused and atomic.
4. Ensure all 25 automated tests pass.
5. Open a Pull Request detailing the problem solved and testing verified.

