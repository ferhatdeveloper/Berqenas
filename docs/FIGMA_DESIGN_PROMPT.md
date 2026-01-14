# Berqenas Cloud Control Panel - Figma Design Prompt

## 🎨 FIGMA PROMPT FOR AI DESIGN

---

## Project Overview

Design a **modern, dark-themed cloud management dashboard** for Berqenas Cloud & Security Platform. This is an enterprise-grade multi-tenant cloud platform with VPN, database sync, and auto-API generation capabilities.

---

## Design Requirements

### Theme & Style
- **Dark Mode**: Primary theme (dark blue/gray backgrounds)
- **Modern & Clean**: Minimal, professional, enterprise-grade
- **Color Palette**:
  - Primary: `#3B82F6` (Blue)
  - Success: `#10B981` (Green)
  - Warning: `#F59E0B` (Orange)
  - Danger: `#EF4444` (Red)
  - Background: `#0F172A` (Dark Blue)
  - Surface: `#1E293B` (Lighter Dark)
  - Text Primary: `#F1F5F9`
  - Text Secondary: `#94A3B8`

### Typography
- **Headings**: Inter Bold
- **Body**: Inter Regular
- **Code/Monospace**: JetBrains Mono

---

## Pages to Design

### 1. Dashboard (Home)
**Layout**: Sidebar + Main Content

**Components**:
- **Top Stats Cards** (4 cards in row):
  - Total Tenants (number + trend)
  - Active VPN Connections (number + status indicator)
  - API Requests (24h, number + graph)
  - Database Sync Status (number + last sync time)

- **Charts Section** (2 columns):
  - Left: Line chart - API requests over time (7 days)
  - Right: Donut chart - Resource usage (CPU, Memory, Storage)

- **Recent Activity Table**:
  - Columns: Timestamp, Event Type, Tenant, Status, Action
  - Show last 10 activities
  - Status badges (Success/Warning/Error)

- **Quick Actions** (floating action buttons):
  - Create Tenant
  - Add Remote Database
  - Generate API

---

### 2. Tenants Management
**Layout**: List view with filters

**Components**:
- **Header**:
  - Title: "Tenants"
  - Search bar
  - Filter dropdown (Status, Database Type)
  - "Create Tenant" button (primary, top-right)

- **Tenant Cards** (Grid, 3 columns):
  Each card shows:
  - Tenant name (large, bold)
  - Database type badge (PostgreSQL/MSSQL)
  - Status indicator (Active/Inactive)
  - VPN status (Connected/Disconnected)
  - Quick stats: Disk usage, Connections, API calls
  - Actions menu (3 dots): Edit, Delete, View Details

- **Create Tenant Modal**:
  - Form fields:
    - Name (text input)
    - Database Type (dropdown: PostgreSQL/MSSQL)
    - Disk Quota (slider, 1-100 GB)
    - Max Connections (number input)
    - VPN Enabled (toggle switch)
    - Public API Enabled (toggle switch)
  - Buttons: Cancel, Create

---

### 3. VPN & Network
**Layout**: Split view (left: list, right: details)

**Left Panel - VPN Clients**:
- List of VPN clients
- Each item shows:
  - Device name
  - IP address (10.60.X.X)
  - Status (Connected/Disconnected with dot indicator)
  - Last seen timestamp
  - Data transferred (upload/download)

**Right Panel - Client Details**:
- Device info card
- Connection stats
- Traffic graph (real-time)
- QR code for config
- Download config button
- Disconnect/Delete buttons

**Firewall Rules Tab**:
- Table view:
  - Source IP, Port, Protocol, Action, Status
  - Add Rule button
  - Toggle enable/disable per rule

---

### 4. Remote Databases
**Layout**: Card grid + detail modal

**Database Cards** (2 columns):
Each card:
- Database name (header)
- Type badge (MSSQL/PostgreSQL)
- WireGuard IP (with copy button)
- Connection status (green/red dot + text)
- Last sync time
- Sync mode badge (Full/Incremental/Realtime)
- Table count
- Actions: Sync Now, Generate API, Settings

**Add Remote Database Modal**:
- Form:
  - Name
  - Database Type (dropdown)
  - WireGuard IP
  - Host, Port, Database Name
  - Username, Password (with show/hide)
  - Schema
- Test Connection button
- Save button

**Sync Details Modal**:
- Sync history timeline
- Stats: Cloud→Local, Local→Cloud, Conflicts
- Conflict resolution strategy selector
- Manual sync trigger
- Schedule settings

---

### 5. Auto-API Generator
**Layout**: Wizard-style (3 steps)

**Step 1 - Select Database**:
- Dropdown: Select remote database
- Or: Enter connection details manually
- Test Connection button

**Step 2 - Select Tables**:
- Checkbox list of all tables
- Each table shows:
  - Table name
  - Column count
  - Primary keys
  - Preview button (shows columns)
- Select All / Deselect All buttons

**Step 3 - Configure & Generate**:
- Output directory input
- API prefix input
- Enable public access toggle
- Generate button (large, primary)
- Progress indicator during generation

**Generated APIs View**:
- List of generated endpoints
- Each endpoint card:
  - Method badge (GET/POST/PUT/DELETE)
  - Endpoint URL (with copy)
  - Table name
  - Try it button (opens API tester)

---

### 6. Gateway & NAT
**Layout**: Service cards + configuration

**Public Services Grid**:
Each service card:
- Service name
- VPN subnet IP → Public port mapping
- Status toggle (Enable/Disable)
- Traffic stats (requests, bandwidth)
- Edit/Delete buttons

**Expose Service Form**:
- Tenant selector
- Service IP (VPN subnet)
- Service port
- Public port
- Description
- IP whitelist (optional, multi-input)
- Expose button

---

### 7. Security & Audit
**Layout**: Tabs (Audit Logs, Security Events, Alerts)

**Audit Logs Tab**:
- Advanced filters:
  - Date range picker
  - Tenant selector
  - Event type dropdown
  - Severity filter
- Table:
  - Timestamp, Tenant, Event, Actor, IP, Status
  - Expandable rows (show full details)
- Export button (CSV/JSON)

**Security Events Tab**:
- Timeline view
- Event cards with severity colors
- Filter by severity

**Alerts Tab**:
- Active alerts list
- Alert configuration
- Notification settings

---

### 8. Billing & Usage
**Layout**: Overview + detailed breakdown

**Overview Cards**:
- Current month cost
- Usage trend graph
- Top consuming tenants
- Quota alerts

**Usage Breakdown Table**:
- Per tenant:
  - Disk usage (GB)
  - Connection hours
  - API calls
  - Realtime events
  - Estimated cost
- Export invoice button

---

### 9. Settings
**Layout**: Sidebar tabs + content area

**Tabs**:
- General
- API Keys
- Notifications
- Integrations
- Security

**General Tab**:
- Platform settings
- Default quotas
- Timezone, Language

**API Keys Tab**:
- List of API keys
- Create new key
- Revoke key

---

## Common Components

### Sidebar Navigation
**Items**:
- Dashboard (home icon)
- Tenants (users icon)
- VPN & Network (shield icon)
- Remote Databases (database icon)
- Auto-API (code icon)
- Gateway & NAT (globe icon)
- Security & Audit (lock icon)
- Billing (credit card icon)
- Settings (gear icon)

**Footer**:
- User profile (avatar + name)
- Logout button

### Top Bar
- Breadcrumbs
- Search (global)
- Notifications bell (with badge)
- User menu dropdown

### Status Indicators
- **Connected**: Green dot + "Connected"
- **Disconnected**: Red dot + "Disconnected"
- **Syncing**: Blue animated spinner + "Syncing"
- **Error**: Red exclamation + "Error"

### Badges
- **Success**: Green background
- **Warning**: Orange background
- **Error**: Red background
- **Info**: Blue background

### Buttons
- **Primary**: Blue, rounded, shadow
- **Secondary**: Gray outline
- **Danger**: Red
- **Icon buttons**: Circular, subtle hover

### Tables
- Dark background
- Hover effect on rows
- Sortable columns
- Pagination at bottom
- Row actions (3-dot menu)

### Modals
- Centered overlay
- Dark background with blur
- Close button (X, top-right)
- Footer with action buttons

### Forms
- Labels above inputs
- Inputs with subtle border
- Focus state (blue glow)
- Error state (red border + message)
- Helper text below inputs

---

## Responsive Design
- **Desktop**: Full layout (1920x1080)
- **Tablet**: Collapsible sidebar (1024x768)
- **Mobile**: Bottom navigation (375x812)

---

## Interactions & Animations
- **Hover states**: Subtle scale/shadow
- **Loading states**: Skeleton screens
- **Transitions**: 200ms ease-in-out
- **Toast notifications**: Slide in from top-right
- **Page transitions**: Fade

---

## Icons
Use **Lucide Icons** or **Heroicons** (outline style)

---

## Data Visualization
- **Charts**: Use Chart.js or Recharts style
- **Graphs**: Clean, minimal, dark theme
- **Colors**: Use palette colors for data series

---

## Special Features

### Real-time Updates
- Live connection status indicators
- Auto-refresh data (every 30s)
- WebSocket connection indicator

### Code Blocks
- Syntax highlighting (dark theme)
- Copy button
- Language badge

### API Tester (in Auto-API page)
- Request builder
- Response viewer
- Save/share functionality

---

## Accessibility
- WCAG 2.1 AA compliant
- Keyboard navigation
- Screen reader friendly
- High contrast mode option

---

## Export This Design As:
1. Figma file (.fig)
2. React components (with Tailwind CSS)
3. Design system documentation

---

## Example Screens Priority
1. **Dashboard** (most important)
2. **Tenants Management**
3. **Remote Databases**
4. **Auto-API Generator**
5. **VPN & Network**
6. Others

---

**This prompt is optimized for Figma AI tools like Galileo AI, Uizard, or v0.dev**
