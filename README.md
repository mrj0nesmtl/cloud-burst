# Cloud ☁️ Capture

[![Version](https://img.shields.io/badge/version-0.1.2-blue.svg)](https://github.com/mrj0nesmtl/cloud-capture/releases)
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

We're currently in the foundation phase, focusing on authentication system implementation. Recent achievements include:
- ✅ Complete UI framework with responsive design
- ✅ Brand identity system implementation
- ✅ Marketing and legal pages
- ✅ Enhanced navigation system
- ✅ Documentation structure

Next major features:
- 🔐 Supabase authentication integration
- 📱 User dashboard development
- 💳 Payment system implementation
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

3. **Environment Setup**
Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

4. **Run Development Server**
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## 📂 Project Structure

```
cloud-capture/
├── src/
│   ├── app/           # Next.js App Router pages
│   │   ├── auth/      # Authentication pages
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── signin/
│   │   ├── legal/     # Legal & compliance pages
│   │   │   ├── cookies/
│   │   │   ├── privacy/
│   │   │   └── terms/
│   │   ├── marketing/ # Marketing & public pages
│   │   │   ├── about/
│   │   │   ├── contact/
│   │   │   └── pricing/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/    # Reusable UI components
│   │   ├── ui/       # Shadcn UI components
│   │   │   ├── aspect-ratio.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── mobile-nav.tsx
│   │   │   ├── mode-toggle.tsx
│   │   │   ├── navigation-menu.tsx
│   │   │   ├── newsletter-form.tsx
│   │   │   ├── radio-group.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── site-footer.tsx
│   │   │   ├── site-header.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── toast.tsx
│   │   │   └── toaster.tsx
│   │   └── theme-provider.tsx
│   ├── hooks/        # Custom React hooks
│   │   └── use-toast.ts
│   └── lib/         # Utility functions & configurations
│       └── utils.ts
├── public/          # Static assets
└── docs/           # Project documentation
```

Key directories:
- `/app`: Next.js 14 App Router pages and layouts
- `/components`: Reusable UI components and Shadcn/ui integrations
- `/hooks`: Custom React hooks for shared functionality
- `/lib`: Utility functions and configurations
- `/public`: Static assets and resources
- `/docs`: Project documentation and guides

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

---

## 📖 Documentation

- [Project Documentation](docs/README.md)
- [API Documentation](docs/api.md)
- [Development Guidelines](docs/development.md)

---

## 📧 Contact

**Joel Yaffe**  
Partner/Developer, Arcana Concept  
📧 [joel@arcanaconcept.com](mailto:joel@arcanaconcept.com)  
🌐 [www.arcanaconcept.com](https://www.arcanaconcept.com)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## ⭐ Show Your Support
If you find Cloud Capture useful, please star the repository to show your support!
