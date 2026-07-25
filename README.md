# 👨‍💻 Developer Portfolio

A full-stack **Personal Portfolio Website** built with **Next.js, React, Tailwind CSS, Prisma, and Supabase** to showcase skills, experience, projects, and enable direct communication through an integrated chat system.

---

## 📖 About

This Developer Portfolio is a comprehensive, dynamic web application designed to showcase professional experience and technical skills. It features a modern, responsive design with smooth animations and includes a backend management system to dynamically update content such as projects, skills, and work experience. Additionally, it integrates a real-time messaging system to allow visitors to chat directly with the portfolio owner.

---

## ✨ Features

- 🎨 Modern, responsive, and highly animated UI (Framer Motion)
- 💼 Dynamic display of Experience, Projects, and Certifications
- 📚 Integrated Git Learning Hub with MDX documentation & visual graphs
- 🛠️ Categorized Skills showcase with visual icons
- 💬 Real-time Chat/Messaging system for visitors
- 🔐 Secure data management with Supabase and Prisma
- 📊 Fully manageable content via PostgreSQL database
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

### Backend
- Node.js
- Next.js API Routes / Server Actions
- Prisma ORM
- Supabase (Authentication & PostgreSQL)

### Database
- PostgreSQL (via Supabase)

---

## 📁 Project Structure

```text
Portfolio/
├── prisma/             # Database schema and migrations
├── public/             # Static assets
├── src/                # Application source code
│   ├── app/            # Next.js App Router pages
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

Create a `.env.local` file in the root directory and add the necessary environment variables for your database and Supabase project:

```env
DATABASE_URL="your_postgresql_database_url"
DIRECT_URL="your_postgresql_direct_url"
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
