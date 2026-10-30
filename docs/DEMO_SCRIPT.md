# CampusConnect • 3-Minute Live Demonstration Script

**Project:** CampusConnect Three-Tier Student Management System  
**Presenter:** Engineering Lead / Portfolio Candidate  
**Target Duration:** ~3 Minutes  

---

## Overview & Demo Timeline

```
0:00 - 0:30  |  Architecture & Live Deployment Status
0:30 - 1:15  |  Dashboard, Live Metrics & Distribution Visualizer
1:15 - 1:55  |  Search, Filter, Sort & CSV Export
1:55 - 2:30  |  CRUD Operations & Database Mutation Guard
2:30 - 3:00  |  Claude Desktop MCP Integration & AI Capabilities
```

---

## Demo Script

### [0:00 - 0:30] Architecture & Deployment
> "Welcome everyone. Today I am presenting **CampusConnect**, a production-grade, three-tier student information management system integrated with an AI-ready Model Context Protocol (MCP) server.
>
> What makes this project unique is that it operates as a full-stack, enterprise-grade architecture with a total infrastructure budget of **₹0 / $0**, utilizing verified free-tier services:
> - **Tier 1 (Client):** React 18 + Vite deployed on Vercel Edge Network.
> - **Tier 2 (Server):** Node.js + Express REST API running on Render.
> - **Tier 3 (Database):** Managed MongoDB Atlas M0 cluster in the cloud.
> - **AI Layer:** Local Model Context Protocol server connecting Claude Desktop directly to our database via structured tools.
>
> In the top navigation bar, you can immediately observe the live database health monitor with an animated status indicator showing `DB: connected`, querying our Render backend in real-time."

---

### [0:30 - 1:15] Dashboard Metrics & Dark Mode
> "At the top of the interface, the dashboard surfaces four real-time analytical metrics:
> 1. **Total Enrolled Students**
> 2. **Active Academic Departments**
> 3. **Average Enrolled Semester**
> 4. **Latest Enrollment**
>
> Below the metric cards, our lightweight **Department Distribution** visualizer renders dynamic progress bars that automatically recalculate department representations as records change—achieved with pure CSS and zero heavy third-party bundle overhead.
>
> Notice the top-right controls: with one click, the system switches between **Dark Mode** and **Light Mode**, automatically persisting user preference to `localStorage` while honoring system `prefers-color-scheme`."

---

### [1:15 - 1:55] Search, Dynamic Filtering, Sorting & CSV Export
> "Now, let's explore our data discovery engine:
> - **Debounced Search:** As I type in the search bar, a custom debounce hook (`useDebounce`) queries both the backend and client data without jitter.
> - **Multi-Factor Filters:** We can filter down by Department or Semester, or sort alphabetically by Student Name, ID, or Date Enrolled.
> - **1-Click CSV Export:** Clicking the 'Export CSV' button generates an RFC 4180-compliant CSV spreadsheet downloaded directly in the browser, complete with escaping and date stamps."

---

### [1:55 - 2:30] Safe CRUD Operations & Mutation Dialogs
> "Let's demonstrate adding a new student record:
> 1. Clicking **'+ Add Student'** opens an accessible modal dialog with autofocus, ESC key binding, and full field validation (Student ID, Name, Email, Department, Semester, and Contact).
> 2. When submitted, the record is immediately committed to MongoDB Atlas, a non-blocking toast notification confirms the change, and the dashboard metrics update in real-time.
> 3. For record safety, clicking **Delete** opens a dedicated confirmation modal with a red warning notice: 'This action permanently deletes the record from MongoDB Atlas.' This prevents accidental data loss."

---

### [2:30 - 3:00] Claude Desktop AI Integration (MCP)
> "Finally, let's look at the AI layer. 
> 
> Through the Model Context Protocol (MCP), Claude Desktop has real-time tool access:
> - Claude can invoke `list_students` to query our database with natural language (e.g. *'Which students are enrolled in Computer Science?'*).
> - Claude can inspect student records using `get_student` or update records via `update_student`.
> 
> Because both the web frontend and Claude Desktop connect to the identical Render REST API and MongoDB Atlas database, changes made in Claude appear on the web dashboard instantly, and vice versa.
>
> Thank you, and I look forward to your questions!"

