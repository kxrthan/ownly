# Ownly

Ownly is a modern, AI-powered platform for centralizing and managing your digitized receipts, active subscriptions, and product warranties in one secure vault. Never lose track of your expenses or miss a warranty claim again.

## Features

- **Receipts Gallery:** Digitally store and organize all your purchase receipts securely. Includes smart categorization and receipt previews.
- **Warranty Tracking:** Keep tabs on product coverages and receive automated alerts before warranties expire.
- **Subscription Management:** Connect and monitor recurring payments so you never pay for a forgotten service again.
- **AI Assistant:** Ask natural language questions about your spending habits, highest expenses, or warranty status using the built-in AI Chat interface.
- **Analytics Dashboard:** Visualize your monthly spending and purchase history with interactive charts.
- **Secure Authentication:** Seamless user authentication and database management powered by Supabase.
- **Premium Tiers:** Built-in integration with Razorpay for upgrading to Pro features (advanced analytics, unlimited exports).
- **Automated Alerts:** Receive email notifications powered by Resend for upcoming warranty expirations.

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) with Vanilla CSS for deep customization.
- **Components:** [shadcn/ui](https://ui.shadcn.com/) (Radix UI primitives)
- **Animations:** [Framer Motion](https://www.framer.com/motion/) & `tw-animate-css`
- **Database & Auth:** [Supabase](https://supabase.com/)
- **Payments:** [Razorpay](https://razorpay.com/)
- **Emails:** [Resend](https://resend.com/)
- **Charts:** [Recharts](https://recharts.org/)
- **AI:** Google Generative AI integration

## Getting Started

First, ensure you have your environment variables set up. Create a `.env.local` file with your keys for Supabase, Razorpay, Resend, and your chosen AI provider (Gemini).

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Performance Enhancements
- Image assets are optimized and lazy-loaded via `next/image` connected to Supabase storage.
- Heavy charting dependencies (like Recharts) are dynamically imported using `next/dynamic` to ensure a blazing-fast initial load (LCP/TTI).

## License

This project is licensed under the MIT License.
