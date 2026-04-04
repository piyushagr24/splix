import { motion } from "framer-motion";
import { BadgeCheck, FileText, ShieldCheck, Zap } from "lucide-react";
import { CreateGroupCard } from "../components/CreateGroupCard";

const howItWorksSteps = [
  {
    title: "Create a group",
    description: "Add a group name, choose currency, set a 4-digit PIN, and add participants."
  },
  {
    title: "Share the links",
    description: "Use the edit link for trusted editors and the view link for read-only sharing."
  },
  {
    title: "Add expenses",
    description: "Unlock edit mode with the PIN, choose who paid, and split costs across the right people."
  },
  {
    title: "Settle and export",
    description: "Track who owes whom, pay through UPI, and export the latest summary as a PDF."
  }
];

function FeatureCard({ title, description, Icon, className = "" }) {
  return (
    <motion.article
      className={`group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm backdrop-blur-md sm:p-5 ${className}`}
      whileHover={{ rotateX: 2.5, rotateY: -2.5, scale: 1.015, y: -2 }}
      whileTap={{ scale: 0.995 }}
      transition={{ type: "spring", stiffness: 280, damping: 20 }}
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute inset-0 rounded-2xl border border-emerald-500/45 shadow-[0_0_30px_rgba(22,163,74,0.24)]" />
      </div>
      <Icon className="h-4 w-4 text-brand-700 sm:h-5 sm:w-5" />
      <h3 className="mt-2.5 text-base font-semibold tracking-tight text-zinc-900 sm:mt-3 sm:text-lg">{title}</h3>
      <p className="mt-2 text-sm text-zinc-700">{description}</p>
    </motion.article>
  );
}

export function LandingPage() {
  return (
    <main className="shell space-y-14 py-2 md:space-y-20 md:py-4" id="top">
      <section className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white/92 px-6 py-16 text-center shadow-sm backdrop-blur-xl md:px-12">
        <motion.h1
          className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-zinc-900 md:text-6xl"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          Split shared expenses with <span className="gradient-text">zero login friction</span>
        </motion.h1>
        <motion.p
          className="mx-auto mt-5 max-w-2xl text-base text-zinc-700 md:text-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        >
          Zero Signups. Just magic links. <span className="gradient-text">For Free.</span>
        </motion.p>
        <motion.div
          className="mt-8 flex items-center justify-center gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.18, ease: "easeOut" }}
        >
          <motion.a
            className="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_35px_rgba(22,163,74,0.28)]"
            href="#create-group"
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.96 }}
          >
            Create Group
          </motion.a>
        </motion.div>
      </section>

      <section className="space-y-3 sm:space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Features</p>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:gap-3 md:grid-cols-6">
          <FeatureCard
            Icon={ShieldCheck}
            className="md:col-span-3"
            description="No accounts, no OTPs, no signup bottlenecks."
            title="No Signups"
          />
          <FeatureCard
            Icon={Zap}
            className="md:col-span-3"
            description="Realtime updates across everyone in the group."
            title="Shared Updates"
          />
          <FeatureCard
            Icon={BadgeCheck}
            className="md:col-span-2"
            description="India-first UPI settlement with QR support."
            title="UPI Ready"
          />
          <FeatureCard
            Icon={FileText}
            className="md:col-span-4"
            description="Export clear summaries with settlements and full expense logs."
            title="PDF Export"
          />
        </div>
      </section>

      <section className="space-y-3 sm:space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">How To Use</p>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:gap-3 md:grid-cols-2">
          {howItWorksSteps.map((step, idx) => (
            <motion.article
              key={step.title}
              className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5"
              initial={{ opacity: 0, y: 14 }}
              transition={{ duration: 0.4, delay: idx * 0.06, ease: "easeOut" }}
              viewport={{ once: true, amount: 0.35 }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                Step {idx + 1}
              </p>
              <h3 className="mt-2 text-base font-semibold text-zinc-900 sm:text-lg">{step.title}</h3>
              <p className="mt-2 text-sm text-zinc-700">{step.description}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section id="create-group" className="mx-auto max-w-3xl scroll-mt-28">
        <CreateGroupCard />
      </section>

      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Crafted by{" "}
          <a
            className="text-emerald-700 underline decoration-emerald-300 underline-offset-4 transition hover:text-emerald-800"
            href="https://www.linkedin.com/in/piyushagr24"
            rel="noreferrer"
            target="_blank"
          >
            Piyush Agrawal
          </a></p>
      </section>
    </main>
  );
}
