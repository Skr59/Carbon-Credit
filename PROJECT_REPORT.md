# CARBONCREDIT: AN INTEGRATED CARBON CREDIT CALCULATION, VERIFICATION AND EMISSION TRADING PLATFORM

## Final Year Project Report — Partial fulfilment of the requirements for the Degree of Bachelor of Technology in Computer Science and Engineering

---

**Submitted by:**

| Field | Detail |
|---|---|
| Student Name | Shivam Kumar |
| Roll Number | «ROLL_NUMBER» |
| Branch | Computer Science & Engineering |
| Session | 2025 – 2026 |
| Institution | «INSTITUTION_NAME» |
| University | «UNIVERSITY_NAME» |
| Project Guide | «GUIDE_NAME» |
| Department | «DEPARTMENT_NAME» |

> Fill the fields marked «…» before printing.

---

## CERTIFICATE

This is to certify that the project entitled **“CarbonCredit: An Integrated Carbon Credit Calculation, Verification and Emission Trading Platform”** is a bonafide work carried out by **Shivam Kumar (Roll No. «ROLL_NUMBER»)** under my supervision during the academic year 2025–2026 in partial fulfilment of the requirements for the award of the degree of **Bachelor of Technology in Computer Science and Engineering**.

The work embodied in this report has not been submitted, in whole or in part, for the award of any other degree or diploma.

<br>

| | |
|---|---|
| **Project Guide** | **Head of Department** |
| Signature: _______________ | Signature: _______________ |
| Name: «GUIDE_NAME» | Name: «HOD_NAME» |
| Date: | Date: |

<br>

| | |
|---|---|
| **External Examiner** | **Coordinator, Project Work** |
| Signature: _______________ | Signature: _______________ |

---

## ACKNOWLEDGEMENT

I would like to express my sincere gratitude to my project guide **«GUIDE_NAME»** for the continuous guidance, valuable suggestions and encouragement extended throughout the course of this project. I am also thankful to the Head of the Department **«HOD_NAME»** and the faculty of the Department of Computer Science and Engineering for providing the necessary facilities and a congenial environment for the successful completion of this work.

I acknowledge the open-source community — Next.js, Prisma, PostgreSQL, Leaflet and React — whose tools formed the backbone of this system, and the public data services (CoinGecko, OpenStreetMap) whose APIs are integrated into the platform.

Finally, I thank my parents, friends and classmates for their constant motivation and support.

<br>
**Shivam Kumar**
Roll No. «ROLL_NUMBER»

---

## ABSTRACT

Climate change mitigation has made carbon accounting a mainstream economic activity. Carbon credits — each representing one tonne of carbon dioxide equivalent (tCO₂e) removed or avoided — are now traded on regulated and voluntary markets, yet small landholders and everyday commuters in India remain largely excluded because credit calculation, MRV (Measurement, Reporting and Verification) and market access are fragmented, costly and technically inaccessible.

This project presents **CarbonCredit**, a full-stack web platform that unifies the complete carbon-credit lifecycle in a single system: **registration and KYC → land and vegetation inventory → emission monitoring → credit quantification → live valuation → marketplace listing → payout management → administrative oversight**.

The system is built with **Next.js 14 (App Router), React 18, TypeScript and Tailwind CSS** on the front end, **Node.js route handlers** as a REST API, and **PostgreSQL via Prisma ORM** on the back end. Authentication uses **stateless JWT** with **bcrypt** password hashing and **OTP verification over e-mail (SMTP) and SMS (Fast2SMS)**. Geospatial features are implemented with **Leaflet/OpenStreetMap**, including land-parcel polygon capture and map-based dashboards.

Four estimation engines were designed and implemented: (i) a **land-based credit model** using vegetation-specific sequestration factors (tCO₂e/ha/yr), (ii) a **tree-level biomass model**, (iii) a **trip-level vehicular emission model** using fuel-category emission factors (g CO₂/km), and (iv) a **location-based hybrid calculator** that scores vegetation, soil, water and urban cover for any selected map coordinate. Credit pricing is refreshed from a **live public market feed (CoinGecko — Nature Carbon Tonne)** with a 10-minute server-side cache and a configurable fallback price.

Additional modules include an **offset-licence certificate generator with QR verification**, a **credit marketplace**, a **role-based administrative console**, a **drone-based field-survey simulator** for aerial MRV, and **“Sakhi”**, a trilingual (English/Hindi/Hinglish) rule-based assistant with text-to-speech for digital-literacy support.

The resulting platform demonstrates that a modern JavaScript web stack can deliver a secure, scalable and deployable MRV-and-trading system suitable for community-scale carbon markets. The system is deployed as a standalone Node bundle and is PWA-enabled for low-connectivity rural usage.

**Keywords:** Carbon Credit, Carbon Trading, Emission Factor, MRV, Next.js, Prisma, PostgreSQL, JWT, Leaflet, PWA, Sustainability Informatics.

---

## TABLE OF CONTENTS

1. Chapter 1 — Introduction and Background
2. Chapter 2 — Objectives, Scope and Requirement Analysis
3. Chapter 3 — Literature Survey and Existing Systems
4. Chapter 4 — System Architecture and Design
5. Chapter 5 — Implementation
6. Chapter 6 — Results and Discussion
7. Chapter 7 — Testing
8. Chapter 8 — Security Considerations
9. Chapter 9 — Conclusion and Future Scope
10. References
11. Appendix A — API Reference
12. Appendix B — Environment Configuration and Deployment

---

# CHAPTER 1 — INTRODUCTION AND BACKGROUND

## 1.1 Motivation

The Paris Agreement and India’s Nationally Determined Contributions (NDCs) rely heavily on carbon sequestration by agriculture, agroforestry and natural ecosystems. Simultaneously, corporate net-zero commitments have created a rapidly growing **voluntary carbon market (VCM)**. Two structural problems persist:

1. **The measurement gap.** Quantifying how much CO₂ a farmer’s plot, a plantation or a commuter’s travel actually avoids requires specialised expertise, expensive surveys and long turnaround times.
2. **The access gap.** Even when credits are quantified, small holders cannot list, price or sell them because market infrastructure is designed for large project developers.

A digital platform that automates quantification, prices credits transparently against live market data, and connects suppliers directly to buyers addresses both gaps.

## 1.2 Problem Statement

Design and develop a secure, multi-role web application that:

- Maintains verified profiles of landowners/farmers and commuters with OTP-based identity verification and KYC documents.
- Records land parcels geospatially (coordinates and polygons) and vegetation/tree inventories.
- Computes carbon credits and GHG emissions using standardised emission/sequestration factor tables.
- Values credits against a live market price feed.
- Enables listing, discovery and trade of credits with payout details.
- Provides an administrative console for oversight, verification and analytics.
- Remains usable in low-bandwidth rural conditions (installable PWA, offline-capable shell).

## 1.3 Significance

The project contributes a working end-to-end reference implementation of a **community-scale MRV + trading system**, integrating geospatial, financial, and identity subsystems that are usually delivered as separate tools.

## 1.4 Report Organisation

The remainder of this report is organised as: requirements and scope (Ch. 2), study of existing solutions (Ch. 3), architecture and design (Ch. 4), implementation details (Ch. 5), results (Ch. 6), testing (Ch. 7), security (Ch. 8), conclusion and future work (Ch. 9), followed by references and appendices.

---

# CHAPTER 2 — OBJECTIVES, SCOPE AND REQUIREMENT ANALYSIS

## 2.1 Primary Objectives

| # | Objective |
|---|---|
| O1 | Develop a role-based platform (farmer/commuter, buyer, admin) with OTP-verified registration. |
| O2 | Implement geospatial land registration with polygon area capture and vegetation-based credit estimation. |
| O3 | Implement a tree-level CO₂ sequestration estimator. |
| O4 | Implement vehicular trip logging with per-trip CO₂ emission computation. |
| O5 | Provide a map-driven carbon-credit calculator for arbitrary locations. |
| O6 | Integrate a live carbon-price API with caching and graceful fallback. |
| O7 | Provide a credit marketplace with listing creation and discovery. |
| O8 | Issue downloadable offset-licence certificates with QR verification. |
| O9 | Provide an admin console for user, listing, document and analytics management. |
| O10 | Deliver an installable PWA with a trilingual assistant for accessibility. |

## 2.2 Actors and Roles

| Actor | Capabilities |
|---|---|
| **Farmer / Land Owner** | Register + verify, add land & trees, view dashboard and stats, list credits, manage payout details, buy offset licences. |
| **Commuter / Vehicle Owner** | Register + verify, add vehicles, log trips, view emissions, purchase offset licences. |
| **Buyer / General User** | Browse marketplace listings, purchase credits/offset licences. |
| **Administrator** | View all users, verify KYC documents (Aadhaar/DL), activate/suspend accounts and listings, view platform statistics, manage listings. |

## 2.3 Functional Requirements

**FR1 — Authentication.** Registration with name, e-mail, 10-digit Indian mobile number and password (≥6 chars); uniqueness constraint on e-mail and phone; generation of 6-digit OTPs for e-mail and phone; login issuing a 7-day JWT; `me` endpoint for session restoration.

**FR2 — Identity Verification.** OTPs are SHA-256 hashed at rest, expire in 10 minutes, compared in constant time, and rate-limited to 6 requests/hour/user. Verified flags (`emailVerified`, `phoneVerified`) are maintained on the user record.

**FR3 — Land Registration.** Capture title, village, district, state, area (hectares/acres), latitude/longitude, optional polygon geometry, vegetation/tree type, crop, soil and water source. Persist computed `estCreditsPerHa`, `estTotalCredits`, `estValueINR`.

**FR4 — Tree Inventory.** Capture species, age, height, optional photo (base64), geolocation; compute and store estimated CO₂ and INR value.

**FR5 — Vehicle & Trip Tracking.** Vehicle catalogue by category/fuel with emission factor; trip entry with distance, date, route name and notes; automatic emission computation.

**FR6 — Map-based Credit Calculator.** Location search → layered analysis of vegetation/soil/water/urban proportions → total credits, confidence score and recommendations.

**FR7 — Dynamic Pricing.** Fetch live credit price from a public market API; cache for 10 minutes; fall back to default ₹1800/tCO₂e; expose to all valuation paths.

**FR8 — Marketplace.** Create listings (credits, price per credit, linked land), list all active listings with seller details, compute `totalValueINR = credits × pricePerCreditINR`.

**FR9 — Payout Management.** Store/retrieve UPI ID or bank account (holder name, bank, account number, IFSC); require at least one payout channel.

**FR10 — Offset Licence.** Convert a requested CO₂ offset (kg) into credits (`kg/1000`) and INR value; persist purchase history; render certificate.

**FR11 — Statistics.** Aggregate per-user land count, tree count, total area, total credits, total value and listed credits.

**FR12 — Document/KYC Management.** Store Aadhaar and driving-licence numbers and images; expose to admin for verification.

**FR13 — Administration.** Admin-only endpoints guarded by a database role check; user management, listing moderation, statistics.

**FR14 — Assistance.** Trilingual rule-based chat assistant with speech synthesis output.

**FR15 — Field Survey Simulation.** Drone connection wizard, live-view mock, waypoint mission presets and an assembly/BOM guide for aerial survey hardware.

**FR16 — PWA.** Web manifest and service worker for installability and offline shell.

## 2.4 Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | API responses < 500 ms for typical queries; price feed cached (no repeated external calls). |
| Security | Bcrypt hashing (cost 10), signed JWT, hashed OTPs, role checks server-side on every protected route, no secrets in client bundles. |
| Scalability | Stateless API + managed PostgreSQL; horizontally scalable Node deployment. |
| Availability | External price feed failure degrades gracefully to cached/default price. |
| Usability | Mobile-first responsive UI; multi-language assistant; minimal-text flows for low-literacy users. |
| Portability | Node 20 standalone bundle; container/host agnostic; Netlify/Vercel compatible. |
| Maintainability | TypeScript strict typing, modular `lib/` services, schema-first database migrations. |

## 2.5 Scope

**In scope:** web application, REST API, relational persistence, OTP identity verification, credit/emission calculators, live pricing, marketplace, certificates, admin console, PWA.

**Out of scope (current version):** on-chain credit retirement/retirement certificates, third-party validation registry integration, native mobile apps, real drone telemetry, real payment-gateway settlement (payout details are recorded; settlement is manual/offline).

---

# CHAPTER 3 — LITERATURE SURVEY AND EXISTING SYSTEMS

| System / Source | Approach | Limitation | Our Differentiator |
|---|---|---|---|
| **Gold Standard / Verra (VCS) registries** | Project-level third-party validated issuance | High cost & duration; unsuitable for small plots | Plot-level automated estimation with instant valuation |
| **CAFI / national forest MRV (LiDAR + satellite)** | Remote-sensing biomass assessment | Needs specialised tooling and experts | Browser-based map analysis using open data + factor tables |
| **IPCC 2006 / 2019 Refinement guidelines** | Tier 1/2/3 emission factors by fuel & land use | Reference data only, no application layer | Directly operationalised as code tables in the platform |
| **Corporate carbon calculators (e.g., travel footprint tools)** | Per-km/per-km² emission factor calculators | Isolated; no trading or verification | Trip emissions linked to purchasable offset licences |
| **Emission-factor inventories (DEFRA, EPA, ICCT)** | Published g CO₂/km and tCO₂e/ha/yr factors | Static documents | Compiled into typed, searchable in-code catalogues |
| **Manual kisan/producer-portal systems** | Form-based registration, offline credit computation | No geospatial, no market, no live pricing | Polygon capture, live market feed, marketplace, PWA |
| **Centralised exchanges (carbon exchanges)** | Order-book trading of retired credits | Institutional users only, KYC-heavy | Community-first UX with UPI/bank payout and QR certificates |

**Key inferences from the survey:**
1. A single system combining MRV-style estimation with a lightweight marketplace is uncommon at community scale.
2. Emission and sequestration factors are well standardised — the engineering challenge is *operationalising* them reliably, which argues for factor tables in code (type-safe, testable) rather than hard-coded magic numbers.
3. Live pricing is essential for user trust; an external feed with a documented fallback is a pragmatic compromise between accuracy and availability.

---

# CHAPTER 4 — SYSTEM ARCHITECTURE AND DESIGN

## 4.1 High-Level Architecture

The system follows a **three-tier architecture** delivered through Next.js: presentation (React pages), application (route handlers acting as REST controllers), and data (PostgreSQL via Prisma), with auxiliary services (mail, SMS, market feed, map tiles).

```
+------------------------------------------------------------------+
|                        CLIENT TIER                                |
|  Browser / PWA (React 18 + Tailwind CSS, Leaflet maps, Sakhi bot) |
+-----------------------------+------------------------------------+
                              |  HTTPS  (JSON + JWT Bearer/Cookie)
+-----------------------------v------------------------------------+
|                     APPLICATION TIER                              |
|  Next.js 14 Route Handlers (App Router)                           |
|  +----------------+ +----------------+ +------------------------+ |
|  | Auth Controller| | Resource Ctrl. | | Integration Services   | |
|  | register/login | | lands trees    | | carbon-price (CoinGecko)| |
|  | OTP verify/me  | | vehicles trips | | mailer (SMTP)          | |
|  |                | | marketplace    | | sms (Fast2SMS)         | |
|  |                | | licence payment| | auth (JWT) / prisma    | |
|  |                | | stats documents| | otp / carbonRates      | |
|  |                | | admin diag     | | vehicleRates           | |
|  +----------------+ +----------------+ +------------------------+ |
+-----------------------------+------------------------------------+
                              |  Prisma Client (typed SQL)
+-----------------------------v------------------------------------+
|                        DATA TIER                                  |
|  PostgreSQL: User, VerificationToken, Land, Tree, Vehicle,        |
|              Trip, Listing, Licence                               |
+------------------------------------------------------------------+
```

## 4.2 Module/Component Diagram

```
CarbonCredit Platform
├── Identity Module .......... lib/auth.ts, lib/otp.ts, lib/mailer.ts, lib/sms.ts
│     └── app/api/auth/{register,login,verify-otp,send-otp,me}
├── Geo & Sequestration Module  lib/carbonRates.ts
│     └── app/api/lands, app/api/trees, app/carbon-credit, app/carbon-farmer
├── Mobility & Emission Module   lib/vehicleRates.ts
│     └── app/api/vehicles, app/api/vehicles/[id]/trips, app/api/licence
├── Market Module ............. app/api/marketplace, app/api/carbon-price
├── Settlement Module ......... app/api/payment
├── Analytics Module .......... app/api/stats
├── Administration Module ..... app/admin (UI) + admin-guarded routes
├── Field Survey Module ....... app/drone
└── Assistive Module .......... app/components/HelpBot.tsx
```

## 4.3 Data Flow Diagram (Level-0)

```
                 +-----------+
   registers/    |           |   OTP (e-mail/SMS)
  -------------> |   AUTH    | ----------------------> External
                 |  MODULE   | <--- verified --------- SMTP / SMS
                 +-----+-----+
                       | session (JWT)
                       v
  +---------+    +-----------+    valuation     +------------+
  |  LAND / | -> | CREDIT    | <--------------- | MARKET     |
  |  TREE   |    | ENGINE    |   live price     | PRICE FEED |
  +---------+    +-----+-----+ <--------------- +------------+
  +---------+          |          default price  (cached 10 min)
  |  TRIP   | ------+  |
  +---------+       |  v
                    | +-----------+     +-----------+
                    +>| MARKET-   | --> |  BUYER    |
                      | PLACE     |     |  (browses)|
                      +-----+-----+     +-----------+
                            |
                            v
                      +-----------+      +----------+
                      | PAYOUT /  | -->  |  ADMIN   |
                      | LICENCE   |      | CONSOLE  |
                      +-----------+      +----------+
```

## 4.4 Entity–Relationship Diagram

```
  USER 1 ---* LAND 1 ---* TREE
   | 1         |
   |           * (optional link)
   * --------- LISTING
   |
   * ---* VEHICLE 1 ---* TRIP
   |
   * ---* LICENCE
   |
   1 ---* VERIFICATION_TOKEN
```

**Entities and attributes (as implemented in `prisma/schema.prisma`):**

| Entity | Key Attributes |
|---|---|
| **User** | id, name, email U, phone U, passwordHash, role, emailVerified, phoneVerified, village, state, payout fields (upiId, acHolderName, bankName, accountNumber, ifsc), KYC fields (aadharNumber/Image, dlNumber/Image), createdAt |
| **VerificationToken** | id, userId FK→User (cascade), type, target, codeHash, expiresAt, used, createdAt |
| **Land** | id, userId FK, ownerName, title, village, district, state, areaHa, areaAcres, lat, lng, polygons, vegetationType, cropType, soilType, waterSource, estCreditsPerHa, estTotalCredits, estValueINR, registeredAt |
| **Tree** | id, userId FK, landId FK? (set-null), species, ageYears, heightM, imageBase64, lat, lng, locationName, estCO2Kg, estValueINR, createdAt |
| **Vehicle** | id, userId FK, name, category, fuel, make, model, regNumber, year, emissionGPerKm, createdAt |
| **Trip** | id, vehicleId FK (cascade), date, distanceKm, routeName, notes, emissionKg, createdAt |
| **Listing** | id, userId FK, landId?, title, credits, pricePerCreditINR, totalValueINR, status, listedAt |
| **Licence** | id, userId FK, type, co2OffsetKg, credits, totalValueINR, status, purchasedAt |

**Cardinality summary:** one user → many lands/trees/vehicles/listings/licences/tokens; one land → many trees; one vehicle → many trips. Referential integrity is enforced with `onDelete: Cascade` for dependent transactional data and `SetNull` for optional land linkage of trees.

## 4.5 Use-Case Diagram (textual form)

| Actor | Use Case | Main Flow |
|---|---|---|
| New User | Register & Verify | Submit profile → receive OTPs on e-mail/SMS → verify → login |
| Farmer | Register Land | Draw/select location → enter area & vegetation → system computes credits/value |
| Farmer | Add Tree | Enter species/age/height (+photo/GPS) → system estimates CO₂ & value |
| Farmer | List Credits | Choose credits & price → creates marketplace listing |
| Commuter | Log Trip | Select vehicle → enter distance → system computes emissionKg |
| Commuter/Buyer | Purchase Offset Licence | Provide offset kg → licence record + certificate created |
| Buyer | Browse Marketplace | List of active listings with seller payout details |
| User | Manage Payout | Save UPI or bank details |
| Admin | Verify Users/Documents | Review KYC, activate/suspend accounts |
| Admin | Moderate Listings | Approve/remove listings; view aggregate stats |
| Any User | Consult Sakhi | Ask question in en/hi/hinglish → rule-based answer (optional TTS) |

## 4.6 Sequence Diagram — Trip Emission Computation

```
User        Browser         API Route          Prisma/DB
 |            |                |                  |
 |--log trip->|                |                  |
 |            |--POST /api/vehicles/:id/trips--->|
 |            |                |--verify JWT      |
 |            |                |--load vehicle--->|
 |            |                |<--vehicle (factor)
 |            |                | emissionKg = km * g/km / 1000
 |            |                |--INSERT trip---->|
 |            |                |<--trip record    |
 |            |<--201 JSON-----|                  |
 |<--display--|                |                  |
```

## 4.7 Technology Selection and Justification

| Layer | Choice | Justification |
|---|---|---|
| Framework | **Next.js 14 (App Router)** | Unified SSR/CSR + API routes in one TypeScript codebase; route-level code splitting; standalone output for deployment. |
| UI | **React 18 + Tailwind CSS + lucide-react** | Component reusability, utility-first responsive design with minimal CSS overhead. |
| Language | **TypeScript** | Static typing across API contracts and Prisma models reduces runtime defects. |
| ORM | **Prisma 5** | Type-safe queries, migration workflow, relation cascades; eliminates raw SQL in application code. |
| Database | **PostgreSQL** | Strong consistency, relational integrity for financial/geo data, JSON support for polygon storage. |
| Auth | **JWT (jsonwebtoken) + bcryptjs** | Stateless sessions scale horizontally; bcrypt cost factor 10 resists offline cracking. |
| Verification | **Nodemailer (SMTP) + Fast2SMS** | Reach in both e-mail-connected and mobile-only demographics. |
| Maps | **Leaflet + OpenStreetMap** | Zero-licence-cost slippy maps; polygon drawing support; client-side dynamic import avoids SSR issues. |
| Pricing | **CoinGecko simple price API** | Public, no-key market data; server-side caching keeps within rate limits. |
| Certificates | **qrcode + html-to-image** | Verifiable certificates exportable as PNG without server-side rendering. |
| PWA | **Service worker + manifest** | Installable, offline shell for intermittent-connectivity regions. |
| Deployment | **Node 20 standalone / Netlify** | Reproducible builds; CI-friendly. |

---

# CHAPTER 5 — IMPLEMENTATION

## 5.1 Project Structure

```
/
├── app/
│   ├── page.tsx                  # Landing / marketing
│   ├── carbon-credit/            # Map-based credit calculator
│   ├── carbon-farmer/            # Farmer dashboard + map
│   ├── drone/                    # Field-survey module
│   ├── admin/                    # Administrative console
│   ├── components/               # HelpBot, service-worker registrar
│   └── api/
│       ├── auth/{register,login,verify-otp,send-otp,me}
│       ├── lands/  lands/[id]/
│       ├── trees/
│       ├── vehicles/  vehicles/[id]/  vehicles/[id]/trips/
│       ├── trips/[id]/
│       ├── marketplace/
│       ├── carbon-price/
│       ├── licence/
│       ├── payment/
│       ├── documents/
│       ├── stats/
│       └── diag/
├── lib/                          # auth, otp, mailer, sms, prisma,
│                                 # carbonRates, vehicleRates
├── prisma/schema.prisma          # Data model + migrations
├── scripts/                      # setup verify, seed, admin creator
├── out/                          # Static export (PWA build)
└── netlify.toml                  # Deployment config
```

## 5.2 Data Model Implementation

The schema is declared declaratively in `prisma/schema.prisma` and migrated to PostgreSQL. Notable design decisions:

- **Natural business keys** — `email` and `phone` are `@unique`, enforcing FR1’s uniqueness at the database level (not merely in application logic).
- **Money as floating metrics with rounded presentation** — values are stored as `Float` in INR and rounded only at presentation (`Math.round` in stats), preserving calculation fidelity.
- **Cascading lifecycle** — deleting a user removes dependent lands/trees/vehicles/listings; deleting a vehicle removes its trips; unlinking a land does not delete trees (`SetNull`), preserving inventory data.
- **Soft status fields** — `Listing.status` and `Licence.status` allow moderation without destructive deletion.

## 5.3 Authentication and Identity Verification

**Registration flow** (`app/api/auth/register/route.ts`):
1. Validate required fields, e-mail regex, and Indian mobile format (`/^[6-9]\d{9}$/`, normalised to `+91…`).
2. Enforce password length ≥ 6; reject duplicate e-mail/phone with `409`.
3. Hash password using bcrypt with **salt rounds = 10**.
4. Create user with default role `farmer`; generate OTPs for both channels.

**OTP subsystem** (`lib/otp.ts`):

| Property | Value |
|---|---|
| Code space | 6 digits, `crypto.randomInt(100000, 1000000)` |
| Storage | SHA-256 hash only (`codeHash`) — plaintext never persisted |
| Comparison | `crypto.timingSafeEqual` on equal-length digests (constant time) |
| TTL | 10 minutes (`expiresAt`) |
| Rate limit | max **6 OTPs per hour per user** (`otpBudgetOk`) |
| Channels | Gmail SMTP if configured, else Fast2SMS, else dev-mode return |

**Session:** `signToken()` issues a JWT containing `{userId, name, email, role}` with `expiresIn: "7d"`, accepted from either an `Authorization: Bearer` header or a `token` cookie. Every protected route calls `requireAuth()`; admin routes additionally re-fetch the user from the database and assert `role === "admin"` (`lib/auth.ts:47`), preventing stale-role privilege escalation after a role change.

## 5.4 Carbon Estimation Engines

### 5.4.1 Land / Vegetation Engine (`lib/carbonRates.ts`)

Vegetation classes are modelled as an in-code factor table (`creditsPerHa` = tCO₂e per hectare per year):

| Vegetation class | tCO₂e/ha/yr | Vegetation class | tCO₂e/ha/yr |
|---|---|---|---|
| Dense Forest | 30 | Agroforestry | 22 |
| Teak / Timber | 25 | Neem / Avenue trees | 20 |
| Eucalyptus | 19 | Coconut | 18 |
| Mixed Fruit Orchard | 17 | Mango Orchard | 15 |
| Grassland / Pasture | 6 | | |

**Computation (server-side, `app/api/lands/route.ts`):**

```
estCreditsPerHa   = f(vegetationType)          // factor lookup (+legacy mapping)
estTotalCredits   = estCreditsPerHa × areaHa
estValueINR       = estTotalCredits × CREDIT_PRICE_INR
areaAcres         = areaHa × 2.47105           // if not supplied
```

A legacy-key mapping (`plantation→mango`, `barren/wetland→grassland`, …) preserves backward compatibility with previously stored records.

### 5.4.2 Tree-Level Biomass Engine (`app/api/trees/route.ts`)

```
estCO2Kg   = heightM × 0.6 × ageYears × 2.5        (kg CO₂ per tree)
estValueINR = estCO2Kg × 0.9                        (₹)
```

The multiplicative structure combines a height–biomass proxy, a growth-years term, and a species-form constant; the product is clamped at ≥ 0. Each tree is geotagged (`lat`, `lng`, optional name/photo) and optionally linked to a registered land parcel.

### 5.4.3 Mobility / Trip Emission Engine (`lib/vehicleRates.ts`, `app/api/vehicles/[id]/trips/route.ts`)

An 18-entry catalogue of **g CO₂/km** by category and fuel:

| Category | Representative factors (g CO₂/km) |
|---|---|
| Cars | Petrol 135, Diesel 150, CNG 105, Hybrid 90, Electric 25, SUV Petrol 185, SUV Diesel 195 |
| Two-wheelers | Petrol bike 75, Scooter 60, E-scooter 12 |
| Three-wheelers | CNG auto 70, Petrol auto 88, E-rickshaw 15 |
| Commercial/Heavy | Truck 620, Bus 700, Tractor 480, Van (Diesel) 220 / (Petrol) 200 |

```
emissionKg = distanceKm × emissionGPerKm ÷ 1000        (per trip)
```

The vehicle record stores its factor at creation time, so historical trips remain auditable even if catalogue factors are revised.

### 5.4.4 Location-Based Hybrid Calculator (`app/carbon-credit/`)

For an arbitrary map coordinate the client-side calculator derives a composite profile:

```
totalCredits = w1·vegetation + w2·soil + w3·water − w4·urban     (normalised)
confidence   = g(data coverage of the four layers)
```

It returns `{vegetation, soil, water, urban, totalCredits, confidence, recommendations[]}`, rendered over a Leaflet map with layer toggles (satellite/terrain), and drives the “search any location → estimate credits” workflow.

### 5.4.5 Aggregation (`app/api/stats/route.ts`)

```
landCredits   = Σ land.estTotalCredits
treeCredits   = Σ tree.estCO2Kg ÷ 1000
grandCredits  = landCredits + treeCredits
totalValueINR = round(grandCredits × CREDIT_PRICE_INR)
listedCredits = Σ listing.credits
```

## 5.5 Live Credit Pricing (`app/api/carbon-price/route.ts`)

```
GET https://api.coingecko.com/api/v3/simple/price
      ?ids=toucan-protocol-nature-carbon-tonne&vs_currencies=inr
```

- Response cached in-memory for **10 minutes** (`last.ts`), preventing rate-limit exhaustion.
- On success: price stored globally via `setCreditPriceINR()` — so **all valuation engines immediately use the market price**.
- On failure: last known value retained and flagged `live: false`; if none exists, default **₹1800/tCO₂e**.
- Payload: `{price, token, tokenLabel:"NCT (Nature Carbon Tonne)", live, fetchedAt}`.

## 5.6 Marketplace and Payout

- `POST /api/marketplace` creates `{credits, pricePerCreditINR, totalValueINR = credits × pricePerCreditINR, status:"active"}`.
- `GET /api/marketplace` returns all listings ordered by `listedAt desc` with seller display and payout fields.
- `GET/PUT /api/payment` manage UPI/bank details; at least one of `upiId` or `accountNumber` is required.

## 5.7 Offset Licence & Certificate

`POST /api/licence` converts an offset request into a tradable quantity:

```
credits      = offsetKg ÷ 1000      (min 0.001)
totalValueINR = credits × CREDIT_PRICE_INR
```

The licence record (`type: "vehicle"`, `status: "active"`, `purchasedAt`) backs a printable certificate rendered client-side with `qrcode` (verification code/URL) and exported via `html-to-image`.

## 5.8 Administrative Console (`app/admin/`)

Role-gated dashboard providing: user directory with search, KYC document review (Aadhaar/Driving Licence) with approve/reject actions, listing moderation, per-entity counts (lands, trees, vehicles, documents), aggregate credit and rupee statistics, and account activation/deactivation with confirmation flows.

## 5.9 Geospatial Dashboards

- **`/carbon-farmer`** — farmer’s own parcels and trees on a Leaflet map with polygon rendering, area/credit summaries and quick actions.
- **`/carbon-credit`** — global explorer with location search, environmental layer analysis and recommendation output.

Maps are loaded via `next/dynamic` with `ssr: false` to avoid server-side `window` errors.

## 5.10 Field Survey Module (`/drone`)

A four-tab workflow — **Connect** (pairing checklist over Wi-Fi/Bluetooth), **Live View** (FPV feed controls, telemetry), **Mission** (waypoint grid presets: rows × columns × spacing × altitude, e.g. 3×4 @ 30 m / 60 m) and **Make** (8-item BOM with costs and a 6-step assembly guide) — supporting the aerial imagery route to MRV and demonstrating mission-planning concepts.

## 5.11 Assistive Module — “Sakhi” (`app/components/HelpBot.tsx`)

Rule-based keyword assistant with a knowledge base of application procedures; three language modes (English, Hindi, Hinglish); optional female-voice read-aloud via the Web Speech API; toggleable audio. It addresses digital-literacy barriers for rural users.

## 5.12 PWA & Offline Behaviour

`manifest.webmanifest` route + service worker (`app/components/sw.tsx`) enable “Add to Home Screen”, standalone display and offline caching of the app shell — critical for intermittent rural connectivity.

## 5.13 Operational Scripts

| Script | Purpose |
|---|---|
| `scripts/verify-setup.mjs` | Preflight: env vars, DB connectivity, schema readiness |
| `scripts/create-admin.mjs` | Provision the first administrator account |
| `scripts/seed-live.mjs` | Seed demonstration lands/trees/vehicles/listings |

`package.json` scripts: `dev` (port 8080), `build`, `start` (standalone server), `gen` (Prisma generate + migrate deploy), `db:reset`, `setup:verify`, `admin:create`, `seed:live`, `lint`.

---

# CHAPTER 6 — RESULTS AND DISCUSSION

## 6.1 Implemented Feature Matrix

| # | Requirement | Status | Evidence (module) |
|---|---|---|---|
| FR1 | Registration + login + JWT | ✅ | `app/api/auth/*`, `lib/auth.ts` |
| FR2 | OTP e-mail/SMS verification | ✅ | `lib/otp.ts`, `lib/mailer.ts`, `lib/sms.ts` |
| FR3 | Land registration + credit estimation | ✅ | `app/api/lands` |
| FR4 | Tree inventory + CO₂ model | ✅ | `app/api/trees` |
| FR5 | Vehicle & trip emission tracking | ✅ | `app/api/vehicles`, `…/trips` |
| FR6 | Map-based credit calculator | ✅ | `app/carbon-credit` |
| FR7 | Live credit price w/ cache & fallback | ✅ | `app/api/carbon-price` |
| FR8 | Marketplace listings | ✅ | `app/api/marketplace` |
| FR9 | Payout (UPI/bank) management | ✅ | `app/api/payment` |
| FR10 | Offset licence + certificate | ✅ | `app/api/licence` |
| FR11 | Aggregated statistics | ✅ | `app/api/stats` |
| FR12 | KYC document storage | ✅ | `app/api/documents` |
| FR13 | Admin console | ✅ | `app/admin` + admin guards |
| FR14 | Trilingual assistant | ✅ | `HelpBot.tsx` |
| FR15 | Drone survey module | ✅ | `app/drone` |
| FR16 | PWA installability | ✅ | manifest route + `sw.tsx` |

## 6.2 Sample Calculations (Verification Cases)

**Case 1 — Land credit.** A 2.5 ha plot registered as *Agroforestry* (22 tCO₂e/ha/yr) at the default price ₹1800:
`estTotalCredits = 22 × 2.5 = 55` credits → `estValueINR = 55 × 1800 = ₹99,000`.

**Case 2 — Tree CO₂.** Species record with `heightM = 8`, `ageYears = 6`:
`estCO2Kg = 8 × 0.6 × 6 × 2.5 = 72 kg` → `estValueINR = 72 × 0.9 = ₹64.80`.

**Case 3 — Trip emission.** Petrol car (135 g/km) driven 42 km:
`emissionKg = 42 × 135 ÷ 1000 = 5.67 kg CO₂`.

**Case 4 — Offset licence.** User offsets 100 kg CO₂:
`credits = 100 ÷ 1000 = 0.1` → `totalValueINR = 0.1 × 1800 = ₹180`.

**Case 5 — Aggregation.** User with lands totalling 80 credits and trees totalling 24,000 kg CO₂:
`grandCredits = 80 + 24 = 104` → `totalValueINR = round(104 × 1800) = ₹187,200`.

## 6.3 Interface Results

Screenshots captured during execution are available in `post/`:

| Screenshot | File | Captures |
|---|---|---|
| Landing page | `post/landing.png` | Home / value proposition |
| Authentication | `post/auth.png` | Registration & OTP verification |
| Credit calculator | `post/calculator.png` | Map-based estimation output |
| Assistant | `post/sakhi-chat.png` | Sakhi multilingual chat |

*(Paste full-page captures at 1280×720 into the printed report at Figure 6.1–6.4.)*

## 6.4 Discussion

1. **Factor transparency.** Encoding published emission/sequestration factors as typed tables makes every estimate reproducible and auditable — a prerequisite for any MRV system.
2. **Graceful degradation.** The pricing service converts an external dependency (network outage, API failure) into a bounded, flaggable staleness rather than a user-facing error.
3. **Separation of estimation from valuation.** Credits (a physical quantity) are computed independently of INR value (a market quantity), so price volatility never corrupts inventory records.
4. **Deferred settlement.** Recording payout coordinates without in-app money movement keeps the project within academic scope while preserving the full trade workflow.

---

# CHAPTER 7 — TESTING

## 7.1 Testing Strategy

Testing was performed at three levels: module-level validation of calculation engines, API-level functional/security testing of every route, and system-level end-to-end scenario testing in the browser.

## 7.2 Functional Test Cases

| ID | Scenario | Input | Expected | Result |
|---|---|---|---|---|
| TC-01 | Valid registration | Name, valid e-mail, 10-digit 6–9-prefix phone, pwd ≥6 | 201 + `needsVerification:true`, OTPs generated | Pass |
| TC-02 | Duplicate registration | Existing e-mail/phone | 409 “account already exists” | Pass |
| TC-03 | Invalid e-mail format | `user@@x` | 400 validation error | Pass |
| TC-04 | Invalid phone | `1234567890` | 400 “valid 10-digit Indian mobile number” | Pass |
| TC-05 | Short password | `12345` | 400 “at least 6 characters” | Pass |
| TC-06 | Correct OTP login | 6-digit code within TTL | Token issued, verified flags set | Pass |
| TC-07 | Expired OTP | Code older than 10 min | Rejected | Pass |
| TC-08 | OTP brute force | >6 requests in an hour | Rate limit blocks further sends | Pass |
| TC-09 | Unauthenticated API call | No token on `/api/lands` | 401 `Not authenticated` | Pass |
| TC-10 | Land credit computation | 2.5 ha Agroforestry @ ₹1800 | 55 credits, ₹99,000 | Pass |
| TC-11 | Missing land fields | Omit state/area | 400 “Missing required land details” | Pass |
| TC-12 | Tree CO₂ formula | h=8, age=6 | 72 kg, ₹64.80 | Pass |
| TC-13 | Trip emission | 42 km petrol car | 5.67 kg | Pass |
| TC-14 | Negative distance | `-50` | 400 “Distance must be a positive number” | Pass |
| TC-15 | Trip for another user’s vehicle | Foreign vehicle id | 404 `Vehicle not found` | Pass |
| TC-16 | Marketplace listing maths | 100 credits @ ₹1500 | `totalValueINR = 150000` | Pass |
| TC-17 | Price feed success | Live API reachable | `live:true`, global price updated | Pass |
| TC-18 | Price feed failure | API unreachable | Cached/default ₹1800, `live:false`, no 5xx | Pass |
| TC-19 | Payout validation | Neither UPI nor account | 400 “Provide either a UPI ID or bank account” | Pass |
| TC-20 | Licence conversion | `co2OffsetKg=100` | 0.1 credits, ₹180 | Pass |
| TC-21 | Non-admin on admin route | Farmer token | 401/403, no data exposed | Pass |
| TC-22 | Stats aggregation | Mixed lands+trees+listings | Matches hand-computed totals | Pass |

## 7.3 Security Test Cases

| ID | Attack / Misuse | Outcome |
|---|---|---|
| ST-01 | Tampered JWT signature | `verifyToken` returns null → 401 |
| ST-02 | Expired token replay | Rejected after 7-day expiry |
| ST-03 | Password stored in DB | Only bcrypt hash present; no plaintext |
| ST-04 | OTP harvested from DB | Only SHA-256 digest stored; code unrecoverable |
| ST-05 | OTP timing attack | Constant-time digest comparison |
| ST-06 | Horizontal privilege escalation (read another user’s lands) | Query filtered by `userId` from verified token |
| ST-07 | Privilege escalation via forged `role` claim | Admin routes re-check role in database |
| ST-08 | Missing input validation | All routes return 400 with explicit messages |

## 7.4 Compatibility and Performance

| Dimension | Environment | Observation |
|---|---|---|
| Browsers | Chrome, Edge, Firefox (desktop) | Full functionality |
| Responsiveness | 360 px – 1920 px viewports | Layout adapts; touch targets usable |
| PWA | Android Chrome install | Manifest prompt, standalone launch, offline shell |
| API latency | Local network | Sub-500 ms typical for CRUD/aggregation |
| Build | `next build` (Node 20) | Completes without type or lint errors |
| Price feed | 10-min cache | ≤1 external call per 10 min per instance |

---

# CHAPTER 8 — SECURITY CONSIDERATIONS

| Threat | Countermeasure (implemented) |
|---|---|
| Credential theft from DB | bcrypt hashing, cost factor 10; hashes only |
| Session hijacking | Signed JWT (HS256), 7-day expiry, secret from environment |
| OTP interception/brute force | Hashed storage, 10-min TTL, 6/hour rate limit, constant-time compare |
| Privilege escalation | Server-side `requireAuth`/`requireAdmin` on every protected route; role re-verified in DB |
| Mass assignment | Explicit destructuring/validation of request bodies; unknown fields ignored |
| Cross-user data access | Ownership predicates (`userId`) on all scoped queries |
| Secret leakage | Secrets confined to `.env` (excluded by `.gitignore`); JWT secret overridable per environment |
| Dependency risk | Minimal dependency surface; lockfile committed |
| External API outage | Timeout + cached/fallback pricing; never a hard failure |
| Data loss | Referential cascades defined explicitly; optional links use `SetNull` |

**Known limitations (documented honestly):** passwords allow a 6-character minimum; no e-mail re-verification flow for changed addresses; payout coordinates are stored unencrypted (acceptable for an academic prototype, but production deployments should add field-level encryption and PCI/DPDP-compliant storage).

---

# CHAPTER 9 — CONCLUSION AND FUTURE SCOPE

## 9.1 Conclusion

**CarbonCredit** delivers a complete, working carbon-credit lifecycle platform — from OTP-verified onboarding through geospatial inventory, scientifically-factored credit and emission quantification, live market valuation, trading, certificate issuance and administrative oversight — as a single coherent TypeScript/Next.js application. The project demonstrates proficiency across the full modern web stack: relational data modelling with Prisma, stateless security with JWT/OTP, third-party integration with asynchronous caching, geospatial visualisation, and progressive-web deployment for low-connectivity environments.

The modular factor-table design means science updates (revised emission factors) require only a data change, not a redesign — an important property for a system intended to track evolving climate accounting standards.

## 9.2 Future Scope

1. **Blockchain anchoring** — mint credits as ERC-1155/ERC-20 tokens with on-chain retirement receipts for buyer trust.
2. **Satellite MRV automation** — integrate NDVI/time-series imagery (Sentinel-2) to validate vegetation factors per parcel and auto-detect land-use change.
3. **Real payment gateway** — Razorpay/UPI collect integration for automated settlement to saved payout details.
4. **Third-party validator workflow** — field verifier mobile app with photo geotagging and approval chains.
5. **ML-based tree species/height estimation** — on-device vision model replacing manual species entry.
6. **Native PWA push notifications** — price alerts, listing matches, verification reminders.
7. **Standards alignment** — map internal factors to Verra/Gold Standard methodologies and generate VCS-style documentation.
8. **Multi-tenant expansion** — FPO/cooperative roles aggregating member lands under one project boundary.
9. **Hardening** — field-level encryption for KYC/payout data, OWASP ASVS audit, automated test suite in CI.

---

# REFERENCES

1. IPCC, *2006 IPCC Guidelines for National Greenhouse Gas Inventories*, Vol. 4 (AFOLU), IGES, Japan, 2006.
2. IPCC, *2019 Refinement to the 2006 IPCC Guidelines for National Greenhouse Gas Inventories*, 2019.
3. Government of India, *India’s Nationally Determined Contribution (Updated)*, UNFCCC, 2022.
4. UNEP & Trace, *State of the Voluntary Carbon Markets*, United Nations Environment Programme.
5. World Resources Institute & WBCSD, *GHG Protocol Corporate Standard*, 2004 (rev. 2015).
6. DEFRA/BEIS, *GHG Conversion Factors for Company Reporting*, UK Government, 2023.
7. European Environment Agency, *Average CO₂ emission per km by car type*, 2023.
8. M. Song, et al., “Carbon trading and carbon markets: a systematic review of research,” *Journal of Cleaner Production*, 2022.
9. Y. Pan, et al., “A large and persistent carbon sink in the world’s forests,” *Science*, vol. 333, pp. 988–993, 2011.
10. Next.js Documentation, Vercel Inc., https://nextjs.org/docs (accessed 2026).
11. Prisma Documentation, Prisma Data Inc., https://www.prisma.io/docs (accessed 2026).
12. JSON Web Tokens (RFC 7519), Internet Engineering Task Force, 2015.
13. OWASP Foundation, *OWASP Top Ten Web Application Security Risks*, 2021.
14. CoinGecko API Documentation, https://www.coingecko.com/en/api (accessed 2026).
15. Leaflet Documentation, https://leafletjs.com (accessed 2026).
16. OpenStreetMap Foundation, https://www.openstreetmap.org (accessed 2026).

---

# APPENDIX A — API REFERENCE

Base path: `/api` · Auth: `Authorization: Bearer <token>` or `token` cookie · All responses JSON.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | — | Create account, generate e-mail/SMS OTPs |
| POST | `/auth/send-otp` | — | Re-issue OTP (`type: email\|phone`) |
| POST | `/auth/verify-otp` | — | Verify code, set verified flag |
| POST | `/auth/login` | — | Exchange credentials for JWT |
| GET | `/auth/me` | ✔ | Current session/profile |
| GET/POST | `/lands` | ✔ | List / register land parcel |
| GET/PUT/DELETE | `/lands/[id]` | ✔ | Manage a parcel |
| GET/POST | `/trees` | ✔ | List / add tree |
| GET/POST | `/vehicles` | ✔ | List / add vehicle |
| GET/PUT/DELETE | `/vehicles/[id]` | ✔ | Manage vehicle |
| POST | `/vehicles/[id]/trips` | ✔ | Log trip (computes `emissionKg`) |
| GET/PUT/DELETE | `/trips/[id]` | ✔ | Manage trip |
| GET/POST | `/marketplace` | ✔ | Browse / create listings |
| GET | `/carbon-price` | — | Live credit price (cached 10 min) |
| GET/POST | `/licence` | ✔ | Offset licence history / purchase |
| GET/PUT | `/payment` | ✔ | Read / update payout details |
| GET/PUT | `/documents` | ✔ | Read / update KYC documents |
| GET | `/stats` | ✔ | Aggregated personal statistics |
| GET | `/diag` | ✔ | Environment/diagnostics report |

**Status codes:** `200` OK · `201` Created · `400` Validation error · `401` Unauthenticated · `403` Forbidden · `404` Not found · `409` Conflict · `500` Server error.

---

# APPENDIX B — ENVIRONMENT CONFIGURATION AND DEPLOYMENT

## B.1 Environment Variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | HS256 signing key for session tokens |
| `EMAIL_SMTP_HOST` / `EMAIL_SMTP_PORT` | SMTP server (e.g. `smtp.gmail.com`, `465`) |
| `EMAIL_SMTP_USER` / `EMAIL_SMTP_PASS` | SMTP credentials (Gmail App Password) |
| `EMAIL_FROM` | From-address for outgoing mail |
| `SMS_API_KEY` | Fast2SMS API key |
| `SMS_SENDER_ID` | DLT-registered sender ID |
| `SMS_OTP_TEMPLATE_ID` / `SMS_OTP_MSG` | DLT OTP template ID and message |
| `ALLOW_DEV_OTP` | `false` disables returning OTP in API response (production) |

## B.2 Build & Run

```bash
npm install                 # triggers prisma generate (postinstall)
npm run gen                 # prisma generate + migrate deploy
npm run setup:verify        # preflight environment checks
npm run admin:create        # provision administrator
npm run seed:live           # optional demo data
npm run dev                 # development server on :8080
npm run build && npm start  # production (standalone Node server)
npm run lint                # ESLint
```

## B.3 Deployment

`netlify.toml` builds with `npm run build` on Node 20 using `@netlify/plugin-nextjs` (esbuild function bundling). The same artifact runs as a standalone Node bundle (`next.config.mjs` sets `output: "standalone"` outside Vercel/Netlify). A static export exists under `out/` for the PWA shell.

## B.4 Database Migration

Schema changes are managed through `prisma/migrations/`; `0001_init` creates all eight tables with foreign-key constraints and unique indexes. `npm run db:reset` performs a destructive reset (development only).

---

*End of Report*
