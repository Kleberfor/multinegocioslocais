# MultiNegócios Locais

Plataforma SaaS para análise e gestão de presença digital de negócios locais.

## Stack

- **Frontend:** Next.js 14 + Tailwind CSS + shadcn/ui
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL + Prisma
- **Payments:** Mercado Pago
- **Deploy:** Vercel

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Setup database
npx prisma migrate dev

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── admin/             # Admin dashboard
│   ├── analisar/          # Analysis page
│   ├── contratar/         # Conversion flow
│   └── resultado/         # Results page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── forms/            # Form components
│   ├── analysis/         # Analysis components
│   └── admin/            # Admin components
├── lib/                   # Utilities and API clients
└── types/                 # TypeScript types
```

## Blueprint

Este projeto foi gerado pelo **ATHENA OS v3.1.0**.

- Blueprint ID: `BP-2026-02-22-001`
- Épicos: 5
- Stories: 14
- Tasks: 71

## License

Private - All rights reserved.
