# Companion — Project Plan

> **Last updated:** 2026-09-19
> **Status:** Phase 0 — Project Foundation (in progress)

---

## 1. Product Overview

**Companion** is a modern, premium dating application targeting the Indian market.

The product will eventually support full user lifecycle flows — registration, profile creation, discovery, matching, messaging, payments, KYC verification, and moderation. The current focus is building a clean MVP with a production-quality architecture that can scale incrementally.

### Product Principles

- **Mobile-first** — Dating is a mobile-dominant use case.
- **Premium feel** — Clean, warm, trustworthy design language.
- **Security-first** — No shortcuts on authentication, data handling, or privacy.
- **Scalable architecture** — Each phase builds on the last without rewrites.

---

## 2. Current MVP Scope

### Phase 0 — Project Foundation (current)

- [x] Project structure established
- [x] Frontend scaffolded with Next.js + TypeScript + Tailwind CSS + shadcn/ui
- [x] Design system foundations (colors, typography, components)
- [x] Authentication abstraction layer
- [x] Login page (email/password — UI + form validation)
- [x] Logout abstraction
- [x] PROJECT_PLAN.md created and populated

### What is NOT in today's scope

- Backend implementation
- Google/Microsoft OAuth
- OTP authentication
- Registration / sign-up flow
- Password reset
- Profile management
- Discovery / matching / messaging
- KYC / Aadhaar verification
- Payments / Razorpay
- Push notifications
- Admin panel

---

## 3. Technology Stack

### Frontend

| Technology       | Purpose                          |
| ---------------- | -------------------------------- |
| Next.js 15       | React framework (App Router)     |
| React 19         | UI library                       |
| TypeScript 5     | Type safety                      |
| Tailwind CSS 4   | Utility-first styling            |
| shadcn/ui        | Component library (not a dep — copies components) |
| React Hook Form  | Form state management            |
| Zod              | Schema validation                |
| TanStack Query 5 | Server-state / async data        |

### Backend (future)

| Technology   | Purpose              |
| ------------ | -------------------- |
| Node.js      | Runtime              |
| Express.js   | HTTP framework       |
| TypeScript   | Type safety          |
| PostgreSQL   | Relational database  |
| Prisma ORM   | Database access      |

### Authentication (future)

| Method           | Provider/Approach           |
| ---------------- | --------------------------- |
| Email/password   | Custom (bcrypt + JWT/sessions) |
| Google OAuth     | Google Identity Services    |
| Microsoft OAuth  | Microsoft Identity Platform |
| Email OTP        | Custom (email service)      |

### KYC (future)

| Verification     | Approach                                      |
| ---------------- | --------------------------------------------- |
| Aadhaar          | Third-party KYC provider (e.g., Digio, Hyperverge) |

> ⚠️ Aadhaar verification will use a legitimate third-party provider. No mock or fake Aadhaar APIs will be created.

### Payments (future)

| Provider   | Purpose                     |
| ---------- | --------------------------- |
| Razorpay   | Payment processing, subscriptions, webhooks |

### Deployment (future)

| Layer    | Target                            |
| -------- | --------------------------------- |
| Frontend | Vercel                            |
| Backend  | Render / Railway / AWS            |
| Database | Neon / Supabase / Railway / AWS RDS |

---

## 4. Architecture Decisions

### 4.1 Next.js App Router

Using the App Router (`app/` directory) for:
- Server Components by default (better performance)
- Nested layouts
- Route groups for organization
- Built-in loading/error states
- Future API route support

### 4.2 Authentication Architecture

The authentication layer is designed as an **abstraction** that separates:

1. **UI Layer** — Login form, buttons, visual states
2. **Form Validation** — React Hook Form + Zod schemas
3. **Auth Service Interface** — TypeScript interface defining the auth contract
4. **Auth Provider (React Context)** — Manages auth state, exposes hooks
5. **Service Implementations** — Concrete implementations (mock for dev, real for production)

This allows adding Google OAuth, Microsoft OAuth, OTP etc. without rewriting UI components.

**Current state:** A development-only mock auth service is used. It is clearly marked as `DEV ONLY` and must be replaced before any production deployment.

### 4.3 State Management

- **Server state**: TanStack Query (for API calls, caching, revalidation)
- **Auth state**: React Context (lightweight, appropriate for auth)
- **Form state**: React Hook Form (scoped to forms)
- **No Redux** — Not needed until demonstrated otherwise

### 4.4 Data Fetching Strategy

- TanStack Query for all server-state (API calls)
- Queries/mutations abstracted into custom hooks
- Not used for purely client-side state
- Will integrate with the auth layer for authenticated requests

### 4.5 Form Strategy

- React Hook Form for all forms
- Zod schemas for validation (shared between client and eventually server)
- `@hookform/resolvers` for Zod integration
- Validation schemas co-located with their forms or in a shared `schemas/` directory

### 4.6 Component Architecture

- shadcn/ui as the base component library (copied into project, fully customizable)
- Custom components built on top of shadcn primitives
- Components are small, focused, and reusable
- Business logic separated from presentation

### 4.7 Styling

- Tailwind CSS with a custom design token layer
- CSS variables for theming (shadcn/ui convention)
- Mobile-first responsive design
- No CSS-in-JS

---

## 5. Folder Structure

```
Companion/
├── PROJECT_PLAN.md                  # This file — project source of truth
├── frontend/
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── app/                     # Next.js App Router pages & layouts
│   │   │   ├── (auth)/              # Route group: authentication pages
│   │   │   │   ├── login/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── layout.tsx
│   │   │   ├── (main)/              # Route group: authenticated app pages
│   │   │   │   └── layout.tsx
│   │   │   ├── layout.tsx           # Root layout
│   │   │   ├── page.tsx             # Root page (redirect logic)
│   │   │   └── globals.css          # Global styles & Tailwind
│   │   ├── components/
│   │   │   ├── ui/                  # shadcn/ui base components
│   │   │   ├── auth/                # Auth-specific components
│   │   │   └── shared/              # Shared/common components
│   │   ├── lib/
│   │   │   ├── auth/                # Auth abstraction layer
│   │   │   │   ├── types.ts         # Auth types & interfaces
│   │   │   │   ├── auth-context.tsx # Auth React context & provider
│   │   │   │   ├── auth-service.ts  # Auth service interface
│   │   │   │   └── mock-auth-service.ts  # DEV ONLY mock implementation
│   │   │   ├── api/                 # API client utilities (future)
│   │   │   └── utils.ts            # General utilities (cn helper etc.)
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── schemas/                 # Zod validation schemas
│   │   ├── types/                   # Shared TypeScript types
│   │   └── config/                  # App configuration & constants
│   ├── .env.example                 # Environment variable template
│   ├── .env.local                   # Local environment (gitignored)
│   ├── next.config.ts               # Next.js configuration
│   ├── tailwind.config.ts           # Tailwind configuration
│   ├── tsconfig.json                # TypeScript configuration
│   ├── components.json              # shadcn/ui configuration
│   └── package.json
└── backend/                         # Empty — future implementation
```

### Folder Structure Rationale

| Directory | Purpose |
|---|---|
| `app/(auth)/` | Route group for unauthenticated pages (login, register, forgot password). Shares an auth-specific layout. |
| `app/(main)/` | Route group for authenticated app pages. Will contain a layout with navigation, auth guards. |
| `components/ui/` | shadcn/ui primitives — Button, Input, Card, etc. |
| `components/auth/` | Auth-specific composed components (LoginForm, etc.) |
| `components/shared/` | Reusable components shared across features |
| `lib/auth/` | Authentication abstraction — types, context, services |
| `schemas/` | Zod validation schemas, potentially shared with backend |
| `hooks/` | Custom hooks (useAuth is re-exported from auth context) |
| `types/` | Shared TypeScript type definitions |
| `config/` | App-level constants and configuration |

---

## 6. Design System

### 6.1 Design Principles

- **Warm & Trustworthy** — Soft gradients, warm accent colors, rounded corners
- **Premium** — Generous whitespace, refined typography, subtle shadows
- **Mobile-first** — Touch-friendly targets, bottom-aligned CTAs, readable text sizes
- **Accessible** — WCAG AA contrast, visible focus states, semantic HTML

### 6.2 Color Palette

Based on CSS variables (shadcn/ui convention), with a warm rose/coral accent:

| Token | Light Mode | Purpose |
|---|---|---|
| `--primary` | Warm rose/coral | Primary actions, brand |
| `--primary-foreground` | White | Text on primary |
| `--secondary` | Soft warm gray | Secondary actions |
| `--background` | Off-white / warm white | Page background |
| `--card` | White | Card surfaces |
| `--destructive` | Red | Errors, destructive actions |
| `--muted` | Light gray | Disabled, secondary text |
| `--accent` | Light rose | Hover states, highlights |
| `--border` | Light warm gray | Borders |

### 6.3 Typography

- Font family: Inter (system fallback stack)
- Scale: Tailwind defaults with custom heading sizes
- Body: 16px base (mobile-friendly)

### 6.4 Spacing & Radius

- Border radius: `0.75rem` default (rounded, premium feel)
- Spacing: Tailwind's default scale
- Touch targets: minimum 44×44px

### 6.5 Component Tokens (shadcn/ui)

shadcn/ui components will be initialized with the "new-york" style variant for a more refined look.

---

## 7. Security Principles

- Never hardcode secrets or API keys
- Use environment variables for all configuration
- `.env.local` is gitignored
- `.env.example` documents required variables (without values)
- Authentication tokens stored securely (httpOnly cookies when backend exists)
- Input validation on both client and server
- CSRF protection (when backend exists)
- Rate limiting (when backend exists)
- No sensitive data in client-side storage (localStorage/sessionStorage) for auth tokens

---

## 8. Testing Strategy

### Current

- TypeScript strict mode as first line of defense
- ESLint for code quality
- Build verification (`next build`)

### Future

| Layer | Tool | Purpose |
|---|---|---|
| Unit | Vitest | Component and utility testing |
| Integration | Testing Library | Component interaction testing |
| E2E | Playwright | Full user flow testing |
| API | Vitest / Supertest | Backend API testing |

---

## 9. Development Phases / Roadmap

### Phase 0 — Project Foundation ← CURRENT
- Project scaffolding
- Design system
- Auth abstraction
- Login UI
- Logout abstraction

### Phase 1 — Authentication (Backend)
- Backend setup (Express + TypeScript + Prisma + PostgreSQL)
- Email/password registration & login (real implementation)
- Session/token management
- Google OAuth integration
- Microsoft OAuth integration
- Email OTP authentication
- Password reset flow

### Phase 2 — User Onboarding & Profile
- Registration flow (frontend)
- Profile creation wizard
- Photo upload
- Profile editing
- Profile viewing

### Phase 3 — Discovery
- User feed / discovery screen
- Filtering & preferences
- Location-based discovery
- Profile cards

### Phase 4 — Matching
- Like / Pass mechanics
- Match notification
- Match list
- Unmatch

### Phase 5 — Messaging
- Real-time chat (WebSocket)
- Message history
- Typing indicators
- Read receipts
- Media sharing

### Phase 6 — Notifications
- Push notifications
- In-app notifications
- Email notifications
- Notification preferences

### Phase 7 — KYC / Verification
- Aadhaar verification via third-party provider
- Verified badge
- Trust score

### Phase 8 — Payments
- Razorpay integration
- Subscription plans
- Payment webhooks
- Payment history
- Subscription management

### Phase 9 — Safety, Moderation & Abuse Prevention
- Report system
- Block system
- Content moderation
- Rate limiting
- Anti-spam measures
- Account suspension

### Phase 10 — Production Hardening & Deployment
- Performance optimization
- Security audit
- Load testing
- Monitoring & logging
- CI/CD pipeline
- Production deployment (Vercel + backend host + managed DB)
- Error tracking (Sentry or similar)

---

## 10. Progress Log

### 2026-09-19 — Phase 0 Completed ✅

**Status:** Complete

**Completed:**
- PROJECT_PLAN.md created and populated
- Frontend scaffolded: Next.js 16.3.5 + React 19.2.8 + TypeScript 5 + Tailwind 4
- shadcn/ui initialized (base-nova style, CSS variables, OKLCH color system)
- Design tokens: Companionly warm plum/berry/rose palette in globals.css
- Auth abstraction: AuthService interface, AuthProvider context, MockAuthService
- Login page: full reference-matching design with hero + form card + footer
- Responsive navbar with mobile Sheet menu
- Full footer with social icons, nav groups, newsletter
- Login form: React Hook Form + Zod validation, show/hide password, loading states
- Placeholder dashboard with logout
- Root redirect → /login
- Background image placeholder with gradient (ready for real asset)
- TanStack Query provider configured
- All checks passing: TypeScript ✅ ESLint ✅ Build ✅

**Dependencies Added:**
- react-hook-form ^7.88.0
- @hookform/resolvers ^5.9.1
- zod ^3.25.76
- @tanstack/react-query ^5.103.1
- shadcn ^4.21.0 (+ @base-ui/react, class-variance-authority, cn, lucide-react, tw-animate-css)

**Decisions Made:**
- Using Next.js App Router (not Pages Router)
- Using shadcn/ui "base-nova" style (latest default)
- Using OKLCH color system (shadcn/ui v4 default)
- Using Zod for form validation
- Auth designed as provider pattern with service interface
- No Redux — using React Context for auth, TanStack Query for server state
- Mock auth service for development only
- Brand name: "Companionly" (per reference design)
- Inter font family (via next/font)
- Inline SVG social icons (Lucide no longer ships brand icons)

**Known Limitations:**
- No real authentication — mock service only (accepts any email + "password123")
- No backend — all API calls are simulated
- Logout clears client state only (no server session invalidation)
- No registration flow
- No OAuth providers (Google/Microsoft buttons present but disabled)
- Background image is a gradient placeholder
- Sign Up tab, Forgot Password, newsletter are non-functional placeholders
- No dark mode implementation (tokens prepared but not active)

**Next Recommended Step:**
- Phase 1: Backend setup + real email/password authentication

### 2026-09-20 — Signup Page Added ✅

**Status:** Complete

**Completed:**
- Sign Up page at `/signup` matching reference design
- SignupForm component: Full Name, Email, Mobile, City (Select dropdown), DOB, Password + Confirm Password (side-by-side), Terms checkbox
- Zod signup schema with password match refinement
- City dropdown using shadcn Select with 20 Indian cities
- Login ↔ Sign Up tab navigation now functional (Link-based)
- Signup hero: different copy, 2×2 trust indicator grid, bottom trust badge bar
- shadcn checkbox and select components added

**User-Made Changes Respected:**
- Auth layout: No navbar/footer (brand logo placeholder header only)
- Login page: Refined gradients, glass card effect, improved spacing
- Auth layout: Full `h-screen` with `overflow-hidden`

**Files Created:**
- `src/components/auth/signup-form.tsx` — Signup form component
- `src/app/(auth)/signup/page.tsx` — Signup page with hero + form
- `src/components/ui/checkbox.tsx` — shadcn checkbox
- `src/components/ui/select.tsx` — shadcn select

**Files Modified:**
- `src/schemas/auth.ts` — Added signupSchema
- `src/config/site.ts` — Added signupTrustIndicators, trustBadges, indianCities
- `src/components/auth/login-form.tsx` — Tabs navigate between /login ↔ /signup

**Verification:** TypeScript ✅ ESLint ✅ Build ✅ (4 routes)

---

## 11. Important Decisions Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-09-19 | App Router over Pages Router | Server components, nested layouts, better DX |
| 2026-09-19 | Zod for validation | Type-safe, composable, sharable with future backend |
| 2026-09-19 | React Context for auth | Lightweight, sufficient for auth state |
| 2026-09-19 | Provider pattern for auth | Allows swapping implementations (mock → real) |
| 2026-09-19 | No Redux | Not needed; TanStack Query handles server state |
| 2026-09-19 | shadcn/ui new-york style | More refined, premium look |
| 2026-09-19 | Warm rose/coral as primary | Warm, approachable, dating-appropriate |

---

## 12. Environment Variables

### Frontend

```env
# .env.example — Document all required variables here (no real values)

# API
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Auth (future)
# NEXT_PUBLIC_GOOGLE_CLIENT_ID=
# NEXT_PUBLIC_MICROSOFT_CLIENT_ID=
```

---

## 13. Future Considerations

- **Internationalization (i18n):** Not in MVP. Consider `next-intl` when needed.
- **Dark mode:** Design system supports it via CSS variables. Implement when prioritized.
- **PWA:** Dating apps benefit from installability. Consider after core features.
- **Analytics:** Integrate after MVP (Mixpanel, PostHog, or similar).
- **Feature flags:** Consider for gradual rollout of new features.
- **Image optimization:** Leverage Next.js Image component. CDN for user-uploaded photos.
- **WebSocket architecture:** Needed for Phase 5 (Messaging). Plan during Phase 4.

---

## 14. Conventions

### Git

- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`
- Feature branches off `main`
- No force pushes to `main`

### Code

- Strict TypeScript (`strict: true`)
- Named exports preferred
- One component per file
- Co-locate tests with source (future)
- Use `cn()` utility for conditional Tailwind classes (from shadcn/ui)

### Files

- React components: `PascalCase.tsx`
- Utilities/hooks: `camelCase.ts`
- Types: `camelCase.ts` or `types.ts`
- Constants: `SCREAMING_SNAKE_CASE` for values, `camelCase` for files
