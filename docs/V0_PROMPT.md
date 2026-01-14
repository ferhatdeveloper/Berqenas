# Berqenas Control Panel - v0.dev Prompt

## Quick Prompt for v0.dev / Vercel AI

```
Create a modern dark-themed cloud management dashboard for Berqenas Platform with:

1. DASHBOARD PAGE:
- 4 stat cards: Total Tenants, Active VPNs, API Requests, Sync Status
- Line chart for API requests (7 days)
- Donut chart for resource usage
- Recent activity table with status badges
- Dark blue theme (#0F172A background, #3B82F6 primary)

2. TENANTS PAGE:
- Grid of tenant cards (3 columns)
- Each card shows: name, database type badge, VPN status, disk usage
- Create tenant modal with form: name, db type dropdown, quota slider, toggles for VPN/API
- Search and filter bar

3. REMOTE DATABASES PAGE:
- Database cards showing: name, type, WireGuard IP, sync status, last sync time
- Add database modal with connection form
- Sync details modal with history timeline and stats

4. AUTO-API GENERATOR PAGE:
- 3-step wizard: Select DB → Select Tables → Generate
- Table selection with checkboxes
- Generated endpoints list with copy buttons

5. VPN & NETWORK PAGE:
- Split view: client list (left) + details (right)
- Connection status indicators
- Firewall rules table

Use: React, TypeScript, Tailwind CSS, shadcn/ui components, Lucide icons
Theme: Dark mode, modern, enterprise-grade
```

---

## Alternative: Galileo AI Prompt

```
Design a cloud platform control panel with dark theme.

Pages needed:
1. Dashboard with stats cards, charts, and activity feed
2. Tenants management with card grid
3. Remote databases with sync status
4. API generator wizard
5. VPN clients list
6. Security audit logs

Style: Modern, dark blue (#0F172A), professional, enterprise SaaS
Components: Cards, tables, modals, forms, badges, charts
Icons: Outline style
```

---

## For Make.com / Figma Plugin

Use the full prompt from: `FIGMA_DESIGN_PROMPT.md`
