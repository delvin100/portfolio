# 👨‍💻 Developer Portfolio

A full-stack **Personal Portfolio Website** built with **Next.js, React, Tailwind CSS, Prisma, and Supabase** to showcase skills, experience, projects, and enable direct communication through an integrated chat system.

---

## 📖 About

This Developer Portfolio is a comprehensive, dynamic web application designed to showcase professional experience and technical skills. It features a modern, responsive design with smooth animations and includes a backend management system to dynamically update content such as projects, skills, and work experience. Additionally, it integrates a real-time messaging system, a multi-account Google Drive dashboard, and live GitHub statistics to provide a deeply interactive experience for visitors.

---

## ✨ Features

- 🎨 Modern, responsive, and highly animated UI (Framer Motion)
- 💼 Dynamic display of Experience, Projects, and Certifications
- 📚 Integrated Git Learning Hub with MDX documentation & visual graphs
- ☁️ **Google Drive Dashboard:** Multi-account integration to seamlessly browse, view, and manage Google Drive files directly from the portfolio.
- 📈 **Live GitHub Stats:** Real-time contribution heatmap and stats fetched via a custom server-side API proxy (bypassing rate limits and adblockers).
- 🛠️ Categorized Skills showcase with visual icons
- 💬 Real-time Chat/Messaging system for visitors
- 🔐 Secure data management with Supabase (Authentication & PostgreSQL)
- 📊 Fully manageable content via an Admin Dashboard
- ⚡ Server-Side Rendering (SSR) for optimal performance and SEO

---

## 🛠️ Tech Stack

### Frontend
- Next.js (App Router)
- React
- Tailwind CSS
- Framer Motion (Animations)
- shadcn/ui & Base UI (Components)
- MDX & next-mdx-remote (Documentation)
- react-github-calendar

### Backend
- Node.js
- Next.js API Routes / Server Actions
- Prisma ORM
- Supabase (Authentication & PostgreSQL)
- Googleapis (Drive v3 API integration)

### Database
- PostgreSQL (via Supabase)

---

## 📁 Project Structure

```text
Portfolio/
├── prisma/             # Database schema and migrations
├── public/             # Static assets
├── src/                # Application source code
│   ├── app/            # Next.js App Router pages (including Admin & API routes)
│   ├── components/     # Reusable React components
│   └── lib/            # Utility functions and configurations
├── .env.local          # Environment variables
├── package.json        # Dependencies and scripts
└── README.md           # Project documentation
```

---

## 🚀 Getting Started

### Clone the repository

```bash
git clone https://github.com/delvin100/Portfolio.git
cd Portfolio
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env.local` file in the root directory and add the necessary environment variables for your database, Supabase project, Google Drive API, and GitHub:

```env
# Database
DATABASE_URL="your_postgresql_database_url"
DIRECT_URL="your_postgresql_direct_url"

# Supabase Authentication
NEXT_PUBLIC_SUPABASE_URL="your_supabase_url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"

# GitHub API (For live stats)
GITHUB_TOKEN="your_github_personal_access_token"

# Google Drive Integration
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
DRIVE_1_REFRESH_TOKEN="college_workspace_refresh_token"
DRIVE_2_REFRESH_TOKEN="personal_drive_refresh_token"
FILES_ACCESS_PASSWORD="password_to_access_files_route"
```

### Database Setup

Run Prisma migrations to set up your database schema:

```bash
npx prisma generate
npx prisma db push
```

### Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 👨‍💻 Author

**Delvin Varghese**

GitHub: https://github.com/delvin100

---

## 📄 License

This project is intended for educational and personal use and is free to use and modify.
