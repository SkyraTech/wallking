# Wall King - B2B Stock & Order Management System

Wall King is a robust, live wallpaper stock availability and order management system built for B2B dealers. It provides an intuitive frontend for stock lookup and an automated WhatsApp bot integration.

## 🚀 Tech Stack
- **Frontend/Backend:** [Next.js](https://nextjs.org/) (App Router, React 19)
- **Styling:** Tailwind CSS, Framer Motion, Lucide Icons
- **Database:** [Supabase](https://supabase.com/) (PostgreSQL)
- **WhatsApp Integration:** Meta WhatsApp Business Cloud API
- **Testing:** Vitest

## 📦 Features
- **Live Stock Lookup:** Dealers can search for any design number and instantly check live inventory in the Hyderabad Central Depot.
- **WhatsApp Webhook:** Fully integrated with the official Meta API to process incoming stock inquiries and handle commands (`HELP`, `AGENT`, `ORDER`).
- **Dynamic Routing & UI:** Beautifully crafted widgets reflecting real-time stock levels with immediate call-to-action buttons for WhatsApp.

## 🛠️ Getting Started

First, install dependencies:
```bash
npm install
```

Configure your environment variables by creating a `.env.local` file (see `.env.example` if available). Make sure to include your Supabase and Meta credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# WhatsApp Meta API (For webhook)
META_WA_ACCESS_TOKEN=your_token
META_WA_PHONE_NUMBER_ID=your_phone_id
META_APP_SECRET=your_app_secret
META_VERIFY_TOKEN=your_custom_verify_token
```

Then, run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🚨 Vercel Deployment Note
If deploying the WhatsApp webhook to Vercel, ensure you handle serverless timeouts properly. Vercel Serverless Functions freeze immediately after a `NextResponse` is returned. Any background tasks triggered after the HTTP response will need specialized Edge handling (`waitUntil` or `unstable_after`) or must be processed synchronously.

## 📝 License
Private repository. All rights reserved.
