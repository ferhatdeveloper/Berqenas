# Berqenas Control Panel

Modern React dashboard for Berqenas Cloud & Security Platform.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 📄 Pages

### ✅ Implemented
- **Dashboard** (`/dashboard`) - Overview with stats and charts
- **Tenants** (`/tenants`) - Multi-tenant management
- **Remote Databases** (`/databases`) - Database sync via WireGuard
- **Auto-API Generator** (`/auto-api`) - Generate REST APIs from tables
- **VPN & Network** (`/vpn`) - WireGuard VPN client management

### 🚧 Coming Soon
- Gateway & NAT
- Security & Audit
- Billing & Usage
- Settings

## 🎨 Tech Stack

- **React 18** + TypeScript
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Lucide Icons** - Icon library

## 🔧 API Integration

Update API base URL in each page:

```typescript
const API_BASE_URL = 'http://localhost:8000/api/v1';
```

## 📦 Project Structure

```
src/
├── pages/
│   ├── BerqenasDashboard.tsx
│   ├── TenantsPage.tsx
│   ├── RemoteDatabasesPage.tsx
│   ├── AutoAPIGeneratorPage.tsx
│   └── VPNNetworkPage.tsx
├── App.tsx
├── main.tsx
└── index.css
```

## 🎯 Features

- Dark theme UI
- Responsive design
- Real-time status indicators
- Modal dialogs
- Form validation
- API integration ready

## 🔐 Authentication

TODO: Add authentication flow

## 📝 Notes

- Replace mock data with real API calls
- Add error handling
- Implement loading states
- Add form validation
- Setup authentication

---

Built for Berqenas Cloud & Security Platform