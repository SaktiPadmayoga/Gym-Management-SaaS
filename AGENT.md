# GymFit SaaS - System Architecture & Developer Agent Reference

This document provides a comprehensive, technical overview of the **GymFit SaaS** platform—a multi-branch, multi-tenant Gym Management Software-as-a-Service system. It outlines the codebase layout, tech stack, database schemas, feature modules, integrations, and deployment configurations to enable developer agents to onboard, research, and contribute safely.

---

## 1. System Overview & Architecture

GymFit is designed as a **Multi-Branch Multi-Tenant SaaS** platform. It allows multiple gym owners (tenants) to register their gym business under a custom subdomain (e.g., `atmagym.gymfit.id`), manage staff, roles, member directories, class schedules, personal training, facility bookings, POS checkouts, and view financial/growth reports.

### Multi-Tenancy Strategy
* **Database-per-Tenant Isolation:** The platform utilizes the `stancl/tenancy` package for Laravel. Each registered tenant receives a completely separate PostgreSQL database (named `gym_tenant_{tenant_uuid}`).
* **Central Database:** The central database (`gym_central`) holds global records including tenant metadata, domains, plans, subscriptions, SaaS admin credentials, and global payment histories.
* **Tenant Context Detection:** Subdomains identify tenant databases automatically. Tenant-scoped API requests are routed via subdomains, injecting the active tenant instance into the execution lifecycle.

### Request Routing Lifecycle
1. **DNS Resolution & TLS (Caddy):** All domain requests (including wildcards like `*.gymfit.id`) hit **Caddy** at the edge, handling SSL verification and routing traffic to the internal **Nginx** web server.
2. **Web Server (Nginx):** Nginx serves as the reverse proxy, forwarding requests to the Next.js standalone container for frontend views or PHP-FPM for backend API routes (`/api/...`).
3. **Database Scoping (Laravel):** The backend middleware detects the tenant domain, resolves the tenant's separate database connection, and boots database migrations/seeds on the fly if necessary.

---

## 2. Tech Stack

### Backend API (Laravel)
* **Framework:** Laravel 12.0 running on PHP 8.2.
* **Authentication:** Laravel Sanctum (token-based APIs for staff/cashier dashboards and member portals) & Laravel Socialite (OAuth for Google Sign-In).
* **Storage:** Cloudflare R2 Object Storage integration via AWS S3 Flysystem driver (`league/flysystem-aws-s3-v3`), serving assets through a dedicated proxy/custom domain.
* **Integrations:** Midtrans PHP SDK (payment gateway for SaaS subscriptions and tenant POS checkouts).
* **Reporting & Exports:** Barryvdh Laravel DomPDF (PDF reports/receipts) and custom CSV streamed exports.

### Frontend SPA (Next.js)
* **Framework:** Next.js 15 (standalone output) running on React 19.
* **State Management:** TanStack React Query (`@tanstack/react-query`) for cache-aware API fetching + Axios client.
* **Styling & Design System:** TailwindCSS 4 + DaisyUI 5 for modern, rich component styling.
* **Micro-Animations:** Framer Motion.
* **Analytical Displays:** Recharts (interactive Line, Pie, and Bar charts for financial reports).
* **Utilities:** Day.js for date manipulation, xlsx for Excel exports, and qrcode.react for check-in QR codes.

### Infrastructure & Database
* **Database Management System:** PostgreSQL 16 (Central + Tenant databases).
* **Containerization:** Docker Compose setup separating services: Caddy, Nginx, PHP, Next.js, and Postgres.

---

## 3. Directory Layout

```
gym-management-system/
├── docker/                  # Nginx, PHP-FPM, Postgres, and Next.js Dockerfiles
├── docs/                    # Database designs (Mermaid schemas)
├── frontend/                # Next.js SPA
│   ├── src/
│   │   ├── app/             # App Router pages ((central) admin & (tenant) portals)
│   │   ├── components/      # UI components, layout, POS, reports, landing elements
│   │   ├── hooks/           # Custom TanStack React Query hooks
│   │   ├── providers/       # Auth (Member & Staff) state providers
│   │   └── types/           # TypeScript interfaces & Zod schemas
│   └── next.config.ts       # Image configuration, remote patterns, env variables
└── src/                     # Laravel Backend API
    ├── app/
    │   ├── Http/
    │   │   ├── Controllers/ # Central and Tenant controllers
    │   │   ├── Middleware/  # Tenancy & branch access validations
    │   │   └── Resources/   # API response formatting
    │   ├── Models/          # Eloquent models (Central & Tenant namespaces)
    │   └── Services/        # Business logic services (Reports, payments, etc.)
    ├── config/              # Filesystems, database, tenancy configs
    └── routes/
        ├── api.php          # Central SaaS routes (Admin dashboard, oauth callback, R2 diagnostic)
        └── tenant.php       # Scoped tenant routes (POS, Member check-in, PT session logs)
```

---

## 4. Database Design & Schemas

### A. Central Database (`gym_central`)
Handles SaaS-level records. The central database consists of the following key tables:

* **`tenants`:** Houses tenant identification, timezone, locale settings, trial/subscription dates, and status (`provisioning|failed|trial|active|suspended|expired`).
* **`domains`:** Maps domains/subdomains to specific tenants.
* **`plans`:** Defines subscription tiers (price, limits on staff, memberships, branches, multi-branch permission).
* **`subscriptions`:** Tracks current plan active status, billing cycle (`monthly|yearly`), and periods.
* **`invoices`:** Records billing invoices for tenants subscribing to GymFit.
* **`payments`:** Logs payment gateway transaction states from Midtrans.
* **`admins`:** Platform administrators (`super_admin|finance|support`).
* **`domain_requests`:** Custom domain mapping requests submitted by tenants.
* **`audit_logs`:** Centralized system events audit logs.

### B. Tenant Database (`gym_tenant_{uuid}`)
Isolates individual tenant data. The schema consists of 30 tables:

* **`branches`:** Registered gym branches under the tenant.
* **`staffs` / `staff_branches`:** Staff data, roles (`owner|staff`), and branch association details.
* **`members`:** Gym member records, status (`active|inactive|expired|frozen|banned`), and check-in history.
* **`membership_plans` / `memberships`:** Subscription plans sold by the gym to members.
* **`class_plans` / `class_schedules` / `class_attendances`:** Group class templates, schedules, and booking logs.
* **`pt_session_plans` / `pt_packages` / `pt_sessions` / `pt_session_attendances`:** Personal training sessions, schedules, trainer assignments, and booking logs.
* **`facilities` / `facility_bookings`:** Gym amenities (pool, sauna, lockers) booking slots.
* **`products` / `stock_movements`:** Inventory products, prices, stock levels, and audit trail of transactions.
* **`tenant_invoices` / `tenant_invoice_items` / `tenant_payments`:** POS transactional cart entries, payment types, and checkouts.

---

## 5. Main Functional Modules

### A. Tenant Registration & Subscriptions
* **Signup Flows:** Gym owners register on the central domain. The system spins up their database dynamically using migrations and runs seeders to establish default roles and permissions.
* **Midtrans Integration:** Centralized billing processes use Midtrans. Webhooks at `api/tenant-auth/register-paid` handle billing states, activating/suspending tenant access.

### B. Point of Sale (POS) & Checkout
* Cashiers checkout cart items comprising products, memberships, or personal training packages.
* Implemented in `POSController.php` and `ProductGrid.tsx`, handling stock validation, invoice numbering (`INV-YYYY-NNNN`), and receipt prints.

### C. QR Code Check-in System
* Members check-in via a dynamic QR code parsed inside the gym's member app.
* The system validates membership validity, home branch settings, and cross-branch permissions in real-time, logging entries into the `check_ins` table.

### D. Group Classes & Personal Training (PT)
* Admin schedules classes and assigns instructors. Members book seats via the portal up to a maximum capacity limit.
* For PT, members purchase session cards (e.g. 10 sessions), check trainer schedule grids, request appointments, and instructors mark sessions complete to decrement the session card balance.

### E. Financial & Analytical Reports
* **SaaS Reports:** Located at `/admin/reports`, showing SaaS Gross Revenue, MRR/ARR, payment method breakdowns, tenant signups, and **Top 5 Spenders (Lifetime Spenders)**.
* **Gym Reports:** Scoped to owner (`TenantReportController`) and branch managers (`BranchReportController`), summarizing check-in foot traffic, sales totals, class attendance, and low inventory items.

---

## 6. Storage & Cloudflare R2 Configuration

Production utilizes **Cloudflare R2** for image storage (like product thumbnail uploads and member avatars). 
* **Driver Configuration:** Configured under `config/filesystems.php` using the `s3` S3-compatible driver.
* **Cache Control:** Configured with `throw => true` in production configuration, preventing silent failures.
* **Fallback Proxy:** If Cloudflare R2 custom domain routes conflict at DNS level, Nginx serves as a reverse proxy fallback redirecting `cdn.gymfit.id` traffic directly to the raw bucket URL:
  `https://<account-id>.r2.cloudflarestorage.com/gymfit-assets/...`

---

## 7. Configuration & Command Guide

When deploying changes to VPS, remember that Laravel caches config, route, and view details. Ensure to run these cleanups in sequence:

```bash
# Pull changes
git pull origin main

# Rebuild containers
docker compose -f docker-compose.prod.yml up --build -d nextjs nginx php

# Clear configs
docker compose -f docker-compose.prod.yml exec php php artisan config:clear
docker compose -f docker-compose.prod.yml exec php php artisan route:clear
docker compose -f docker-compose.prod.yml exec php php artisan view:clear
```
