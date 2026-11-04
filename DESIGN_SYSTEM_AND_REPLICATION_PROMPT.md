# Floating Island UI Design System & Replication Master Prompt

> **Purpose**: This document provides the complete design specification, exact design tokens, component architecture, and a **plug-and-play AI prompt** to replicate this exact layout, floating island shell, color palette, border radii, responsive behavior, and components for any product, SaaS dashboard, or landing page.

---

## Part 1: Complete AI Generation Prompt (Copy & Paste Ready)

Use the prompt below in any AI tool (AI Studio, Claude, Cursor, v0, ChatGPT) to reproduce this exact layout for any domain (e.g., E-Commerce, Fintech, Project Management, Healthcare, Creator Tools):

```markdown
Build a modern, high-craft web application with a distinctive "Floating Island Shell" layout, soft pastel accent palette, high border radii, and fluid desktop/mobile responsiveness matching this exact specification:

### 1. ARCHITECTURAL SHELL ("Floating Island" System)
Instead of a generic full-width sticky topbar or rigid fixed sidebar, construct the UI using floating detached surface islands:

1. TOP-LEFT LOGO TILE:
   - Desktop (xl+): Fixed position `fixed top-5 left-5 z-40`, size 52x52px, border-radius 18px (`rounded-[18px]`), bg `#FFFFFF` (dark: `#181B1F`), subtle border `border-[#E3E6E8]` (dark: `#2A2F35`), shadow `shadow-[0_1px_2px_rgba(20,22,26,0.04),0_8px_24px_rgba(20,22,26,0.06)]`.
   - Contains the brand mark / icon centered (30x30px).

2. FLOATING NAV PILL:
   - Desktop (xl+): `fixed top-5 left-[84px] z-40`, height 48px, rounded-full (`rounded-full`), padded 4px, background surface with subtle border and floating shadow.
   - Horizontal navigation links in uppercase font (`text-[13px] font-semibold tracking-[0.08em]`).
   - Active state: sliding pill background chip (`bg-[#EDEEEF]` in light, `#272C33` in dark) with smooth spring layout transition.
   - Counter badges: pill badges using electric lime `#D4F56B` with dark `#14161A` bold text.

3. FLOATING TOP-RIGHT UTILITY CLUSTER:
   - Desktop (xl+): `fixed top-5 right-5 xl:right-10 z-40 flex items-center gap-3`.
   - Pill status button (`h-10 px-3.5 rounded-full`) with live status indicator dot (green/red) and uppercase tracking text.
   - Primary Action Button: circular 40x40px or pill in vibrant lime `#D4F56B` hover `#C9EE55` with bold `#14161A` icon/label and spring click feedback.
   - User Profile Button: `h-10 px-2 rounded-full border border-border-subtle bg-surface` with avatar and name, opening a popup dropdown menu.

4. FLOATING VERTICAL LEFT RAIL (Quick Filters / Tools):
   - Desktop (xl+): `fixed top-28 left-5 z-40 flex flex-col items-center w-[52px] p-1.5 gap-1.5 bg-surface border border-border-subtle rounded-[20px] shadow-md`.
   - Tool/filter icon buttons: 40x40px, `rounded-[14px]`. Active button fills with lime `#D4F56B` and dark `#14161A` icon; inactive buttons have subtle hover backgrounds with floating tooltip on hover.

5. FLOATING BOTTOM-LEFT CONTROLS:
   - Desktop (xl+): `fixed bottom-5 left-5 z-40 flex flex-col gap-3`.
   - Two 52x52px `rounded-[20px]` floating buttons:
     a) Theme Toggle: smooth animated transition between Sun and Moon.
     b) Help / Keyboard shortcuts button (? icon).

6. MOBILE & TABLET LAYOUT (< xl breakpoint):
   - Top Bar: Floating minimal bar with Logo tile on left, Quick Action (+) and Hamburger menu (☰) on right.
   - Bottom Bar: Floating pill tab bar `fixed bottom-3.5 inset-x-0 mx-auto w-[min(90%,360px)] h-14 bg-surface/95 backdrop-blur-md rounded-full shadow-2xl px-3 flex items-center justify-between` with clean icon-only buttons and center elevated primary button.
   - Slide-over Drawer: Left-to-right drawer panel (40% width on tablet, 80% on phone) with branded header, uppercase navigation links, and rounded full-width bottom setting pills.
   - On-Page Quick Filters: In mobile/tablet view, place quick filter chips horizontally inside the page header with smooth horizontal swipe rather than cramming into the sidebar.

7. MAIN CONTENT CANOPY:
   - Viewport: Fluid width without restrictive arbitrary max-width (`w-full min-h-screen pt-[76px] sm:pt-[84px] xl:pt-[96px] pb-24 xl:pb-12 px-4 sm:px-6 md:px-8 xl:pl-[104px] xl:pr-10`).
   - Fade Mask: Soft top gradient fade mask (`hidden xl:block pointer-events-none fixed top-0 inset-x-0 h-14 bg-gradient-to-b from-canvas via-canvas/90 to-transparent z-30`) so content scrolls gracefully under the floating pills.

---

### 2. EXACT COLOR PALETTE & DESIGN TOKENS
Implement full Light Mode and Dark Mode support with these exact hex tokens:

- Canvas (App Background):
  - Light: `#F2F4F4` (soft, airy alabaster-gray, NOT pure white)
  - Dark: `#0F1113` (deep slate carbon)
- Surface (Cards, Modals, Islands):
  - Light: `#FFFFFF`
  - Dark: `#181B1F`
- Surface Subtle:
  - Light: `#F3F5F6`
  - Dark: `#1F2328`
- Active Chip / Selected State:
  - Light: `#EDEEEF`
  - Dark: `#272C33`
- Borders:
  - Subtle: Light `#E3E6E8` | Dark `#2A2F35`
  - Strong: Light `#D7DBDF` | Dark `#373E47`
- Typography / Ink:
  - Ink Primary: Light `#14161A` | Dark `#F2F4F5`
  - Ink Secondary: Light `#4A515B` | Dark `#A3AAB3`
  - Ink Muted: Light `#636B76` | Dark `#8A929C`
  - Ink Disabled: Light `#A3AAB3` | Dark `#555E68`
- Signature High-Energy Accent:
  - Electric Lime: `#D4F56B` (Hover: `#C9EE55`)
  - RULE: ALL text, icons, and strokes inside `#D4F56B` lime elements MUST be high-contrast dark `#14161A` in BOTH light and dark mode. Never allow white text on lime.
- Pastel KPI Accent System:
  - Pastel Lavender: `#C9C3F5` (Metric card / primary indicator)
  - Pastel Sky: `#A9C8FA` (Metric card / schedule indicator)
  - Pastel Mint: `#92E2B3` (Metric card / conversion indicator)
  - Pastel Peach: `#F8CDB0`
  - Pastel Butter: `#F6E7A1`
  - Pastel Rose: `#F5B8C4`
- Semantic Status Colors:
  - Success: `#2FB67C` (Text: `#1F7A55`)
  - Attention / Due / Warning: `#F5B544`
  - Overdue / Urgent: `#E5484D` (Text: `#C2363B`)
  - Cool / Inactive: `#7BB2F9`

---

### 3. TYPOGRAPHY & CORNER RADII (Geometries)
- Font: `'Plus Jakarta Sans', -apple-system, sans-serif`.
- Hierarchy:
  - Section Title: `text-[28px] leading-[34px] font-bold tracking-[-0.02em]`
  - Card Title: `text-base sm:text-lg font-bold tracking-tight`
  - Nav & Status Badges: `text-[11px] or text-[13px] font-bold tracking-[0.08em] uppercase`
- Corner Radii:
  - Large Primary Content Cards: `rounded-[20px]` (20px)
  - Floating Shell Island Tiles: `rounded-[18px]` or `rounded-[20px]`
  - Rail & Action Icon Buttons: `rounded-[14px]` (14px)
  - Inputs & Dropdowns: `rounded-xl` (12px)
  - Interactive Action Chips: `rounded-lg` (8px)
  - Navbars, Modals Pointers, Badges, Floating Tab Bar: `rounded-full` (9999px)

---

### 4. DASHBOARD & INNER PAGE PATTERNS
1. 12-Column Responsive Layout:
   - Split main area into 9 columns (primary metrics, charts, main table) + 3 columns (side feature cards, upcoming action items, quick member list).
2. Pastel KPI Trio Cards:
   - 3 colored cards at the top using `#C9C3F5` (Lavender), `#A9C8FA` (Sky), and `#92E2B3` (Mint).
   - Each card displays small uppercase label, large 24px bold metric number, trend delta badge, and a floating icon button.
3. Activity Chart Card:
   - Header with `flex-wrap` and `whitespace-nowrap` on title so it never awkwardly breaks words into multiple lines.
   - Timeframe pill selector (`7D`, `30D`, `90D`) + Lime Export button.
   - Dual-bar chart using Lavender (`#C9C3F5`) and Mint (`#92E2B3`) with rounded bar caps (`radius={[6,6,0,0]}`).
4. Data Table with Zero-Wrap Safeguards:
   - Wrap all tables in `overflow-x-auto pb-1` with minimum width (e.g., `min-w-[560px]` or `min-w-[640px]`).
   - Every column header must have `whitespace-nowrap font-semibold` and column cells must not wrap labels into 2 lines.
   - "View all" link button: `shrink-0 whitespace-nowrap min-w-fit leading-none` in lime `#D4F56B`.
5. Slide-Over Action Drawers:
   - Quick Add / Create side sheet sliding in from the right with `motion/react` spring physics (`damping: 30, stiffness: 320`).
   - Sticky bottom footer actions with loading spinners (`Loader2 animate-spin`) and disabled button state during form submission.
6. Optimistic UI Updates:
   - Instantly update state in the UI upon user submit, with background network sync and automatic rollback with specific error toasts if the server request fails.
```

---

## Part 2: Visual Component Blueprint & Measurements

### 1. The Desktop Floating Shell Coordinates
| Component | Position | Dimensions | Corner Radius | Shadow / Border |
| :--- | :--- | :--- | :--- | :--- |
| **Logo Tile** | `fixed top-5 left-5` | `52px × 52px` | `18px` | `border-border-subtle/80 shadow-md` |
| **Nav Pill** | `fixed top-5 left-[84px]` | `Auto × 48px` | `rounded-full` | `border-border-subtle/80 shadow-md` |
| **Left Rail** | `fixed top-28 left-5` | `52px × Auto` | `20px` | `border-border-subtle/80 shadow-md` |
| **Bottom Controls** | `fixed bottom-5 left-5` | `52px × 116px` | `20px` each | `border-border-subtle/80 shadow-md` |
| **Top-Right Cluster**| `fixed top-5 right-10` | `Auto × 40px` | `rounded-full` | `border-border-subtle/80 shadow-md` |
| **Content Viewport** | `pt-24 pl-[104px] pr-10` | Fluid 100% | N/A | Top fade gradient mask |

### 2. Color Variables Reference Table
| Token Name | Light Mode Hex | Dark Mode Hex | Intended Usage |
| :--- | :--- | :--- | :--- |
| `--color-canvas` | `#F2F4F4` | `#0F1113` | Entire page background |
| `--color-surface` | `#FFFFFF` | `#181B1F` | Cards, modals, floating pills |
| `--color-surface-subtle` | `#F3F5F6` | `#1F2328` | Input backgrounds, hover rows |
| `--color-active-chip` | `#EDEEEF` | `#272C33` | Nav pill active indicator, chip fills |
| `--color-border-subtle` | `#E3E6E8` | `#2A2F35` | Thin dividers, card borders |
| `--color-border-strong` | `#D7DBDF` | `#373E47` | Active borders, input focus |
| `--color-ink` | `#14161A` | `#F2F4F5` | Primary body and heading text |
| `--color-ink-secondary` | `#4A515B` | `#A3AAB3` | Subtitles, inactive navigation |
| `--color-ink-muted` | `#636B76` | `#8A929C` | Timestamps, table header labels |
| `--color-lime` | `#D4F56B` | `#D4F56B` | Primary CTAs, active highlights |
| `--color-lime-hover` | `#C9EE55` | `#C9EE55` | Hover state for primary CTAs |
| `--color-pastel-lavender`| `#C9C3F5` | `#C9C3F5` | Metric Card 1 / Chart Bar 1 |
| `--color-pastel-sky` | `#A9C8FA` | `#A9C8FA` | Metric Card 2 / Active Pill |
| `--color-pastel-mint` | `#92E2B3` | `#92E2B3` | Metric Card 3 / Chart Bar 2 |
| `--color-pastel-butter`| `#F6E7A1` | `#F6E7A1` | Financial / Revenue Highlight Card |
| `--color-card-teal` | `#17807D` | `#146B69` | High-contrast callout card |

---

## Part 3: Anti-Slop & Craft Rules (Must Follow)
1. **Never use generic pure black `#000000` text or pure white `#FFFFFF` background for canvas**: Always use rich ink `#14161A` on `#F2F4F4` canvas for high-end organic warmth.
2. **Lime Accent Contrast Enforced**: All buttons, badges, and chips with background `#D4F56B` MUST have text color `#14161A` and icon stroke `#14161A` regardless of theme mode.
3. **No Ugly Wrapping**:
   - Buttons like `"View all"` must have `whitespace-nowrap min-w-fit shrink-0`.
   - Card headers must use `flex-wrap items-center justify-between gap-3` so titles like `"Leads Activity"` never split into two broken lines.
   - Tables must have horizontal scroll wrappers (`overflow-x-auto`) with minimum table width (`min-w-[600px]`) and `whitespace-nowrap` headers.
4. **Interactive States**:
   - Action buttons must show a loading spinner (e.g., `Loader2` from Lucide) and be disabled during asynchronous submission to prevent double-clicks.
   - Floating buttons have tactile spring motion feedback: `whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}`.
5. **Small Screens First-Class Treatment**:
   - Sidebar filters must not clutter the mobile drawer. Provide clean horizontal scrolling filter chips directly on the page header.
   - Mobile navigation uses a bottom floating pill (`w-[min(90%,360px)] h-14 rounded-full`) with high-contrast icon buttons.

---

## Part 4: How to Apply this to Any Business Domain

| Domain | What to Adapt |
| :--- | :--- |
| **SaaS Analytics** | Change Lavender card to "Monthly Recurring Revenue", Sky to "Churn Rate", Mint to "Active Subscriptions". |
| **E-Commerce Store** | Change Left Rail to Category filters (Apparel, Shoes, Accessories). Nav tabs to "Store", "Orders", "Discounts". |
| **Freelancer Invoicing** | Change Lime button to "New Invoice (N)". Pastel cards to "Unpaid", "Paid This Month", "Overdue". |
| **Landing Page** | Use the Floating Nav Pill for "Product", "Features", "Pricing", "Docs". The Top-Right Cluster has "Log In" + Lime "Get Started" CTA. |
