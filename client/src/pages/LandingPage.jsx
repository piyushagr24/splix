import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  Copy,
  Crown,
  Download,
  ExternalLink,
  FileText,
  Home,
  Lock,
  Plus,
  QrCode,
  Receipt,
  ShieldCheck,
  Users,
  Utensils,
  Wallet,
  WifiOff,
  Zap
} from "lucide-react";
import { CreateGroupCard } from "../components/CreateGroupCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/* =======================================================================
   INTERNAL WEBSITE UI MOCKUPS / SCREENSHOT PREVIEWS
   These mirror the exact look & feel of ViewPage and EditPage.
======================================================================= */

function ExpenseTrackerPreview() {
  return (
    <div className="rounded-2xl border border-zinc-200/90 bg-white shadow-sm overflow-hidden text-left">
      {/* Mini App Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 bg-zinc-50/70 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span className="text-sm font-bold text-zinc-900">Manali Trip 🏔️</span>
          <Badge variant="success" className="text-[10px] font-semibold py-0.5 px-2">
            INR (₹)
          </Badge>
        </div>
        <span className="text-xs text-zinc-500">
          Total Spent: <strong className="text-zinc-800 font-semibold">₹24,800</strong>
        </span>
      </div>

      {/* Expense Items List */}
      <div className="p-4 sm:p-5 space-y-2.5">
        {/* Item 1 */}
        <div className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50/50 p-3 text-xs transition hover:bg-zinc-50">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-700 shrink-0">
              <Home className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-zinc-900 text-xs sm:text-sm">Riverside Cottage (2 Nights)</p>
              <p className="text-[11px] text-zinc-500">Paid by Alex • Split equally across 4</p>
            </div>
          </div>
          <div className="text-right">
            <span className="font-bold text-zinc-900 text-xs sm:text-sm">₹16,000</span>
            <span className="block text-[10px] text-emerald-700 font-semibold">₹4,000 / person</span>
          </div>
        </div>

        {/* Item 2 */}
        <div className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50/50 p-3 text-xs transition hover:bg-zinc-50">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
              <Utensils className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-zinc-900 text-xs sm:text-sm">Old Manali Cafe Dinner</p>
              <p className="text-[11px] text-zinc-500">Paid by Priya • Split equally across 4</p>
            </div>
          </div>
          <div className="text-right">
            <span className="font-bold text-zinc-900 text-xs sm:text-sm">₹4,800</span>
            <span className="block text-[10px] text-emerald-700 font-semibold">₹1,200 / person</span>
          </div>
        </div>

        {/* Item 3 */}
        <div className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50/50 p-3 text-xs transition hover:bg-zinc-50">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700 shrink-0">
              <Receipt className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-zinc-900 text-xs sm:text-sm">Solang Valley Passes</p>
              <p className="text-[11px] text-zinc-500">Paid by Rohan • Split equally across 4</p>
            </div>
          </div>
          <div className="text-right">
            <span className="font-bold text-zinc-900 text-xs sm:text-sm">₹4,000</span>
            <span className="block text-[10px] text-emerald-700 font-semibold">₹1,000 / person</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function UpiSettlementPreview() {
  return (
    <div className="rounded-2xl border border-zinc-200/90 bg-white shadow-sm overflow-hidden text-left">
      {/* Top Banner */}
      <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/70 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-emerald-600" />
          <span className="text-sm font-bold text-zinc-900">Settlements</span>
        </div>
        <Badge variant="outline" className="text-[10px] font-semibold text-zinc-600 bg-white">
          2 Pending Debts
        </Badge>
      </div>

      <div className="p-4 sm:p-5 space-y-3">
        {/* Settlement Item 1 - Active */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3.5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900">
                <span>Rohan</span>
                <span className="text-zinc-400 font-normal">owes</span>
                <span className="text-emerald-800">Alex</span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">Clears cottage and passes split</p>
            </div>
            <div className="text-right">
              <span className="text-base font-extrabold text-emerald-800">₹2,800</span>
            </div>
          </div>

          {/* 1-Tap UPI CTA Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-emerald-200/60">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
              <QrCode className="h-3.5 w-3.5" /> Pay via UPI
            </span>
            <div className="flex items-center gap-1 text-[11px] font-medium text-zinc-500">
              <span className="rounded bg-white border border-zinc-200 px-1.5 py-0.5">GPay</span>
              <span className="rounded bg-white border border-zinc-200 px-1.5 py-0.5">PhonePe</span>
              <span className="rounded bg-white border border-zinc-200 px-1.5 py-0.5">Paytm</span>
            </div>
          </div>
        </div>

        {/* Settlement Item 2 */}
        <div className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50/60 p-3 text-xs">
          <div>
            <div className="flex items-center gap-1.5 font-semibold text-zinc-900">
              <span>Neha</span>
              <span className="text-zinc-400 font-normal">owes</span>
              <span className="text-emerald-800">Priya</span>
            </div>
            <p className="text-[10px] text-zinc-500">Dinner share</p>
          </div>
          <span className="font-bold text-zinc-900">₹1,200</span>
        </div>
      </div>
    </div>
  );
}

function AnalyticsPdfPreview() {
  return (
    <div className="rounded-2xl border border-zinc-200/90 bg-white shadow-sm overflow-hidden text-left">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/70 px-4 py-3 sm:px-5">
        <span className="text-sm font-bold text-zinc-900">Analytics &amp; Export</span>
        <span className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-[11px] font-semibold text-zinc-700 shadow-sm">
          <Download className="h-3 w-3 text-emerald-600" /> Export PDF
        </span>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Top Spender</span>
            <div className="flex items-center gap-1.5 mt-1">
              <Crown className="h-3.5 w-3.5 text-amber-500" />
              <p className="text-xs font-bold text-zinc-900">Alex (₹16,000)</p>
            </div>
          </div>
          <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Average / Person</span>
            <p className="text-xs font-bold text-zinc-900 mt-1">₹6,200</p>
          </div>
        </div>

        {/* Category Breakdown Progress Bars */}
        <div className="space-y-2">
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-zinc-700">
              <span>Stay &amp; Cottage (65%)</span>
              <span>₹16,000</span>
            </div>
            <div className="h-2 w-full rounded-full bg-zinc-100 overflow-hidden">
              <div className="h-full rounded-full bg-purple-500" style={{ width: "65%" }} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-zinc-700">
              <span>Food &amp; Dining (19%)</span>
              <span>₹4,800</span>
            </div>
            <div className="h-2 w-full rounded-full bg-zinc-100 overflow-hidden">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: "19%" }} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-zinc-700">
              <span>Transport &amp; Passes (16%)</span>
              <span>₹4,000</span>
            </div>
            <div className="h-2 w-full rounded-full bg-zinc-100 overflow-hidden">
              <div className="h-full rounded-full bg-blue-500" style={{ width: "16%" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =======================================================================
   LANDING PAGE COMPONENT
======================================================================= */

export function LandingPage() {
  return (
    <main className="shell max-w-4xl space-y-24 sm:space-y-32 py-10 sm:py-16 pb-32" id="top">
      {/* 1. HERO SECTION */}
      <section className="text-center space-y-6 pt-4 sm:pt-8">
        <motion.h1
          className="mx-auto max-w-3xl text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-900 leading-[1.12]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          Split shared expenses with <span className="gradient-text">zero login friction</span>
        </motion.h1>

        <motion.p
          className="mx-auto max-w-xl text-base sm:text-lg text-zinc-600 leading-relaxed"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08, ease: "easeOut" }}
        >
          No apps, no accounts, and no OTPs. Just magic links for you and your friends, with instant 1-tap UPI settlement.
        </motion.p>

        {/* Hero Actions */}
        <motion.div
          className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15, ease: "easeOut" }}
        >
          <Button
            size="lg"
            asChild
            className="h-12 px-7 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-[0_10px_25px_rgba(22,163,74,0.28)] gap-2 active:scale-95 transition-all"
          >
            <a href="#create-group">
              <Plus className="h-4 w-4" /> Create a Group
            </a>
          </Button>

          <Button
            variant="outline"
            size="lg"
            asChild
            className="h-12 px-6 rounded-2xl border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 font-semibold text-sm gap-2"
          >
            <a href="#why-splix">
              Explore Features <ArrowDown className="h-3.5 w-3.5 text-zinc-400" />
            </a>
          </Button>
        </motion.div>
      </section>

      {/* 2. WHY SPLIX? (FEATURES WITH INTERNAL WEBSITE PREVIEWS) */}
      <section id="why-splix" className="space-y-16 scroll-mt-20">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">
            Why Splix?
          </h2>
          <p className="text-sm sm:text-base text-zinc-500 max-w-lg mx-auto">
            Built for effortless group expense sharing without corporate accounts, forgotten passwords, or awkward math.
          </p>
        </div>

        {/* Feature Showcase 1: Real-Time Expense Tracking */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <Receipt className="h-5 w-5" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-zinc-900">
              Real-time expense logs with instant splits
            </h3>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Log bills on the go with category tags and customized splits. Whether it’s equal sharing or custom amounts, balances recalculate live across everyone in the group.
            </p>
            <ul className="text-xs text-zinc-500 space-y-1.5 pt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Categorize stay, food, transport &amp; passes
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Full participant split transparency
              </li>
            </ul>
          </div>
          <div className="lg:col-span-7">
            <ExpenseTrackerPreview />
          </div>
        </div>

        {/* Feature Showcase 2: 1-Tap UPI Settlement */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 order-2 lg:order-1">
            <UpiSettlementPreview />
          </div>
          <div className="lg:col-span-5 space-y-3.5 order-1 lg:order-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <QrCode className="h-5 w-5" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-zinc-900">
              1-Tap UPI settlement &amp; smart debt simplification
            </h3>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Splix runs a debt-simplification algorithm that minimizes the number of transactions needed. Pay friends directly in Google Pay, PhonePe, Paytm, or BHIM with native deep links and dynamic QR codes.
            </p>
            <ul className="text-xs text-zinc-500 space-y-1.5 pt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Deep links launch your favorite UPI app
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Dynamic QR codes for quick desktop-to-mobile scanning
              </li>
            </ul>
          </div>
        </div>

        {/* Feature Showcase 3: Visual Analytics & PDF Export */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-zinc-900">
              Visual analytics &amp; itemized PDF exports
            </h3>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Gain clear visibility into who spent the most, category breakdowns, and group averages. Export clean, audit-ready PDF receipts whenever you’re ready to archive.
            </p>
            <ul className="text-xs text-zinc-500 space-y-1.5 pt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Category breakdown bars &amp; top spender metrics
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Downloadable itemized PDF report
              </li>
            </ul>
          </div>
          <div className="lg:col-span-7">
            <AnalyticsPdfPreview />
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS (STEP-BY-STEP VISUAL WORKFLOW) */}
      <section id="how-it-works" className="space-y-10 scroll-mt-20">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">
            How It Works
          </h2>
          <p className="text-sm sm:text-base text-zinc-500 max-w-md mx-auto">
            From group creation to settlement in 3 easy steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 Card */}
          <div className="rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                Step 01
              </span>
              <h3 className="text-base font-bold text-zinc-900">Create &amp; Set PIN</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Enter your group name, pick your currency, set a 4-digit PIN for editors, and list members.
              </p>
            </div>
            {/* Visual Snippet */}
            <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-3 text-xs space-y-1.5 text-zinc-700">
              <div className="flex justify-between font-semibold">
                <span>Manali Trip 🏔️</span>
                <span className="text-emerald-700">PIN: ••••</span>
              </div>
              <p className="text-[11px] text-zinc-500">Alex, Priya, Rohan, Neha (4 members)</p>
            </div>
          </div>

          {/* Step 2 Card */}
          <div className="rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                Step 02
              </span>
              <h3 className="text-base font-bold text-zinc-900">Share Magic Links</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Send the Edit link to trusted organizers and the View link to everyone else for read-only access.
              </p>
            </div>
            {/* Visual Snippet */}
            <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-3 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-emerald-800">Edit Link (PIN Protected)</span>
                <Copy className="h-3 w-3 text-zinc-400" />
              </div>
              <div className="flex items-center justify-between text-[11px] text-zinc-500">
                <span>View Link (Read-Only)</span>
                <Copy className="h-3 w-3 text-zinc-400" />
              </div>
            </div>
          </div>

          {/* Step 3 Card */}
          <div className="rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                Step 03
              </span>
              <h3 className="text-base font-bold text-zinc-900">Split &amp; Settle via UPI</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Record expenses anytime—even offline. Clear debts with 1 tap via UPI deep links or QR code.
              </p>
            </div>
            {/* Visual Snippet */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 text-xs flex items-center justify-between">
              <div>
                <p className="font-semibold text-zinc-900">Rohan owes Alex</p>
                <p className="text-[10px] text-emerald-700 font-bold">₹2,800</p>
              </div>
              <span className="rounded-md bg-emerald-600 px-2 py-1 text-[10px] font-bold text-white shadow-sm">
                Pay UPI
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. EMBEDDED CREATE GROUP FORM (DIRECTLY ON THE LANDING PAGE — NO POPOUTS) */}
      <section id="create-group" className="space-y-6 scroll-mt-20">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">
            Create a Group
          </h2>
          <p className="text-sm sm:text-base text-zinc-500 max-w-md mx-auto">
            Ready to split? Fill in the group details below to generate your magic links instantly.
          </p>
        </div>

        {/* The entire form embedded directly on the page */}
        <div className="max-w-2xl mx-auto">
          <CreateGroupCard isDialog={false} />
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="!mt-10 sm:!mt-14 pt-6 border-t border-zinc-200/80 flex items-center justify-center sm:justify-end text-sm sm:text-base font-medium text-zinc-600">
        <div>
          Crafted by{" "}
          <a
            className="text-emerald-700 font-bold underline decoration-emerald-400 decoration-2 underline-offset-4 hover:text-emerald-800 transition"
            href="https://www.linkedin.com/in/piyushagr24"
            rel="noreferrer"
            target="_blank"
          >
            Piyush Agrawal
          </a>
        </div>
      </footer>
    </main>
  );
}
