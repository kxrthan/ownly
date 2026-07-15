# Product Requirements Document (PRD): Ownly - AI Purchase Manager

## 1. Product Overview

**Product Name:** Ownly
**Purpose:** An AI-powered purchase manager designed to ensure users never lose their receipts, warranties, manuals, invoices, or subscription details again. Ownly uses AI to automatically categorize, organize, and track everything a user buys.
**Target Audience:** Consumers and small business owners who struggle to keep track of their purchase records, warranties, and recurring subscriptions.

## 2. Core Features

### 2.1 AI-Powered Receipt & Invoice Processing

- **Smart Extraction:** Users can upload or email receipts/invoices. AI automatically extracts key data points (merchant, date, amount, items, taxes).
- **Auto-Categorization:** Purchases are automatically categorized (e.g., Electronics, Software, Office Supplies) based on extracted data.
- **Searchable Database:** All extracted text becomes fully searchable, allowing users to find specific purchases instantly.

### 2.2 Warranty & Manual Management

- **Warranty Tracking:** AI identifies warranty periods from receipts/invoices and automatically calculates expiration dates.
- **Proactive Alerts:** Users receive notifications before a warranty expires.
- **Manual Fetching:** Based on the product name and model extracted from the purchase, the system automatically finds and links digital user manuals.

### 2.3 Subscription Tracking

- **Recurring Expense Detection:** Identifies subscriptions from purchase history or connected accounts.
- **Renewal Reminders:** Alerts users before a subscription renews to avoid unwanted charges.
- **Cost Analytics:** Provides a dashboard view of total monthly/yearly subscription costs.

### 2.4 User Dashboard & Analytics

- **Spending Overview:** Visual charts and graphs showing spending patterns over time (utilizing Recharts).
- **Document Vault:** Secure storage for all original receipts, invoices, and manuals.
- **Export Functionality:** Users can export their data or generate reports in PDF format for tax or accounting purposes.

## 3. User Flow

1.  **Onboarding:** User signs up using Email/Password or OAuth (via Supabase Auth).
2.  **Data Input:**
    - User uploads a photo/PDF of a receipt via the web interface.
    - _Alternative:_ User forwards an email receipt to a dedicated Ownly email address.
3.  **AI Processing:** The system processes the document, extracting metadata and categorizing the item.
4.  **Verification:** The user is presented with the extracted data to verify or edit if necessary (optional).
5.  **Dashboard View:** The newly processed item appears in the user's dashboard with associated warranties, manuals, and categorization.
6.  **Alerts:** If a warranty is nearing expiration or a subscription is renewing, the user receives an email/in-app notification.

## 4. Technical Architecture & Stack

- **Frontend Framework:** Next.js (App Router), React
- **Styling & UI:** Tailwind CSS, Shadcn UI, Framer Motion for animations
- **Authentication & Database:** Supabase (PostgreSQL, Supabase Auth)
- **AI Integration:** `@ai-sdk/google` (Gemini) for text extraction and document analysis
- **Payments/Billing:** Razorpay
- **Data Visualization:** Recharts
- **Document Generation/Export:** `jspdf`, `html-to-image`
- **Form Handling:** React Hook Form with Zod validation
- **Email Notifications:** Resend

## 5. Non-Functional Requirements

- **Security:** All uploaded documents must be securely stored. User data must be encrypted at rest and in transit.
- **Performance:** AI processing should return results within seconds to ensure a smooth user experience.
- **Responsiveness:** The web application must be fully responsive and work seamlessly on mobile devices for on-the-go receipt scanning.
- **Accessibility:** The UI should adhere to WCAG standards for accessibility.

## 6. Future Scope

- **Bank Account/Credit Card Integration:** Automatically sync transactions to match with uploaded receipts.
- **Mobile App:** Dedicated iOS/Android applications with native document scanning features.
- **Return Window Tracking:** Track retail return windows and alert users before the window closes.
