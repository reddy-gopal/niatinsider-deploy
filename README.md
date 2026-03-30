# NIAT Insider 🚀

**The unofficial NIAT survival guide. For the students. By the students. Of the students.**

NIAT Insider is a comprehensive platform designed to help students navigate campus life, admissions, placements, and more at NIAT campuses across India. It features authentic student-written reviews, how-to guides, and a community-driven approach to sharing knowledge.

## ✨ Key Features

- 🏫 **Campus Directory:** Explore 15+ NIAT campuses across India with detailed reviews and info.
- 📘 **Survival Guides:** Practical "How-to" guides for every stage of your NIAT journey (Week 1, Hostels, Clubs).
- ✍️ **Student Reviews:** Read honest, authentic reviews from students already on the ground.
- 📈 **Placements & Insights:** Get real data and advice on placements and internships.
- 🤝 **Community Contributions:** A platform where students can contribute their own articles and insights.
- 🔍 **Search & Discover:** Quickly find specific campus details or guide articles.

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [Radix UI](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/)
- **State & Data:** [SWR](https://swr.vercel.app/), [Axios](https://axios-http.com/)
- **Forms & Validation:** [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/)
- **Charts:** [Recharts](https://recharts.org/)
- **Feedback:** [Sonner](https://sonner.steventey.com/)

## 📁 Project Structure

```text
src/
├── app/            # Next.js App Router (pages and layouts)
├── components/     # Reusable UI components (Navbar, Footer, CampusCard, etc.)
├── constants/      # App-wide constants and configuration
├── data/           # Static data and mock data
├── hooks/          # Custom React hooks (useCampuses, useArticles, etc.)
├── lib/            # Utility functions and API clients
├── types/          # TypeScript interface and type definitions
└── proxy.ts        # API proxy configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm / yarn / pnpm

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd niatinsider
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## 🌐 Deployment

The application is optimized for deployment on the [Vercel Platform](https://vercel.com).
For additional setup guidance, see the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

---
*Built with ❤️ for the NIAT community.*
