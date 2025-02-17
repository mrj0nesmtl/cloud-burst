# Cloud ☁️ Capture

[![Version](https://img.shields.io/badge/version-0.1.3-blue.svg)](https://github.com/mrj0nesmtl/cloud-capture/releases)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green)](https://supabase.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Styling-38B2AC)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Last Updated](https://img.shields.io/badge/last%20updated-February%202024-brightgreen)](CHANGELOG.md)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

<!-- Replit-friendly version -->
<div align="center">

`v0.1.2` • `Next.js 14` • `TypeScript 5.0` • `Supabase` • `TailwindCSS` • `MIT License`

</div>

## 🎯 Current Status

We're making significant progress on the authentication system implementation. Recent achievements include:
- ✅ Supabase client configuration and types
- ✅ Authentication context implementation
- ✅ Error boundary components
- ✅ Loading states and UI feedback
- ✅ Enhanced TypeScript integration
- ✅ Complete UI framework with responsive design
- ✅ Brand identity system implementation
- ✅ Marketing and legal pages
- ✅ Enhanced navigation system
- ✅ Documentation structure

Next major features:
- 🔐 Complete authentication flow implementation
- 📱 Protected route system
- 🔑 Role-based access control
- 📸 Core photography features

## 📸 Elevating Event Photography

Cloud Capture is an AI-powered event photography platform designed to enhance guest engagement and streamline photo collection at large gatherings. Inspired by the nostalgia of disposable cameras placed on event tables, Cloud Capture modernizes the experience by leveraging guests' smartphones and a seamless cloud-based infrastructure.

---

## 🚀 Key Features

- **Frictionless Access**: No app download required—guests simply scan a QR code and start capturing moments instantly.
- **Seamless Photo Collection**: All images are automatically uploaded to a centralized event gallery controlled by the event host.
- **AI-Driven Organization**: Machine learning algorithms intelligently filter, categorize, and enhance photos, removing duplicates and organizing images based on facial recognition, timestamps, and themes.
- **Real-Time Engagement**: View, moderate, and share photos instantly within an AI-curated event gallery.
- **Privacy Controls**: Event organizers can moderate content and set permissions for sharing, ensuring a curated and brand-aligned experience.
- **Monetization Potential**: Offers opportunities for premium add-ons, such as branded event albums, AI-enhanced edits, and highlight reels.

---

## 🔧 Tech Stack

### Frontend
- **Next.js 14** (App Router, React 18)
- **TypeScript 5.0+**
- **Tailwind CSS**
- **Shadcn UI**
- **Zustand** (State Management)
- **TanStack Query** (Data Fetching)
- **React Hook Form + Zod** (Form Management)

### Backend & Infrastructure
- **Supabase**
  - Real-time Database
  - Authentication
  - Storage
  - Row Level Security
- **PostgreSQL** (Primary Database)
- **Redis** (Caching) [Planned]

### AI/ML Integration
- **TensorFlow.js** (Real-time AI image enhancement)
- **OpenCV** (Image filtering & duplicate detection)
- **DeepSeek** (Advanced AI-driven curation & tagging)
- **OpenAI** (Image enhancement & categorization)

### Deployment & Security
- **Replit** (Development & Staging)
- **GitHub Actions** (CI/CD)
- **Sentry** (Error Monitoring)
- **Cloudflare** (CDN & Security) [Planned]

---

## 🛠️ Development Setup

### Prerequisites
- Node.js v20+
- Git
- npm or yarn
- Supabase CLI
- TypeScript 5.0+

### Environment Setup
Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SITE_URL=your_site_url
```

### Getting Started

1. **Clone the Repository**
```bash
git clone https://github.com/mrj0nesmtl/cloud-capture.git
cd cloud-capture
```

2. **Install Dependencies**
```bash
npm install
```

3. **Run Development Server**
```bash
npm run dev
```