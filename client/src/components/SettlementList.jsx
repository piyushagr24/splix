import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, QrCode, Zap } from "lucide-react";
import { toast } from "sonner";
import { money } from "../utils/format";
import { buildQrUrl, buildUpiLink } from "../utils/upi";

export function SettlementList({ settlements, participants, currency, groupName, onToggleSettled, readOnly = false }) {
  const [openRow, setOpenRow] = useState("");
  const byId = new Map(participants.map((participant) => [participant.id, participant]));

  async function copy(text) {
    await navigator.clipboard.writeText(text);
    toast.success("UPI ID copied");
  }

  function openUpi(upiLink) {
    window.location.href = upiLink;
  }

  return (
    <section className="card reveal reveal-3">
      <div>
        <h2 className="text-base font-semibold text-zinc-900 sm:text-xl">Settlement Plan</h2>
        {!settlements.length ? <p className="mt-3 text-xs text-zinc-600 sm:text-base">All settled. No payments required.</p> : null}
      </div>
      <div className="mt-3 grid gap-2.5 sm:mt-4 sm:gap-3">
        {settlements.map((item) => {
          const payee = byId.get(item.toParticipantId);
          const rowKey = `${item.fromParticipantId}-${item.toParticipantId}`;
          const isOpen = openRow === rowKey;
          const hasUpi = Boolean(payee?.upiId);
          const upiLink = hasUpi
            ? buildUpiLink({
                upiId: payee.upiId,
                name: payee.name,
                amountMinor: item.amountMinor
              })
            : "";

          return (
            <div key={rowKey} className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm sm:p-4">
              <div className="flex items-start justify-between gap-2 sm:gap-3">
                <p className="min-w-0 flex-1 text-xs text-zinc-900 sm:text-base">
                  {item.fromName} {'->'} {item.toName} : <span className="font-semibold">{money(item.amountMinor, currency)}</span>
                </p>
                {readOnly ? (
                  item.settled ? (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700 sm:px-2.5 sm:py-1 sm:text-xs">
                      <Check size={13} />
                      Settled
                    </span>
                  ) : (
                    <span className="inline-flex shrink-0 rounded-full border border-zinc-300 px-2 py-0.5 text-[11px] text-zinc-600 sm:px-2.5 sm:py-1 sm:text-xs">
                      Mark as settled
                    </span>
                  )
                ) : (
                  <button
                    className={item.settled ? "inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700 sm:px-2.5 sm:py-1 sm:text-xs" : "inline-flex shrink-0 rounded-full border border-zinc-300 px-2 py-0.5 text-[11px] text-zinc-700 transition hover:bg-zinc-100 sm:px-2.5 sm:py-1 sm:text-xs"}
                    onClick={() => onToggleSettled(item)}
                    type="button"
                  >
                    {item.settled ? <Check size={13} /> : null}
                    {item.settled ? "Settled" : "Mark as settled"}
                  </button>
                )}
              </div>
              {!hasUpi  && !item.settled ? <p className="mt-1 text-xs text-zinc-600 sm:text-sm">Add UPI ID in profile to enable direct Pay with UPI and QR settlement.</p> : null}
              {hasUpi && !item.settled ? (
                <div className="mt-3 space-y-1.5 sm:space-y-0 ">
                  <button
                    className="btn-ghost w-full rounded-xl !border-emerald-200 !bg-emerald-50 px-2.5 py-1.5 text-[11px] !font-medium !text-emerald-700 hover:!bg-emerald-100 sm:hidden"
                    onClick={() => openUpi(upiLink)}
                    type="button"
                  >
                    <Zap size={14} />
                    Pay with UPI
                  </button>
                  <div className="grid grid-cols-2 gap-1.5 sm:hidden">
                    <button
                      className="btn-ghost min-w-0 rounded-xl px-2.5 py-1.5 text-[11px]"
                      onClick={() => setOpenRow(isOpen ? "" : rowKey)}
                      type="button"
                    >
                      <QrCode size={16} />
                      {isOpen ? "Hide QR" : "Show QR"}
                    </button>
                    <button className="btn-ghost min-w-0 rounded-xl px-2.5 py-1.5 text-[11px]" onClick={() => copy(payee.upiId)} type="button">
                      <Copy size={16} />
                      Copy UPI ID
                    </button>
                  </div>
                  <div className="hidden sm:flex sm:flex-wrap sm:gap-2">
                    <button
                      className="btn-ghost shrink-0 rounded-xl !border-emerald-200 !bg-emerald-50 px-4 py-2 text-sm !font-medium !text-emerald-700 hover:!bg-emerald-100"
                      onClick={() => openUpi(upiLink)}
                      type="button"
                    >
                      <Zap size={16} />
                      Pay with UPI
                    </button>
                    <button
                      className="btn-ghost shrink-0 rounded-xl px-4 py-2 text-sm"
                      onClick={() => setOpenRow(isOpen ? "" : rowKey)}
                      type="button"
                    >
                      <QrCode size={16} />
                      {isOpen ? "Hide QR" : "Show QR"}
                    </button>
                    <button className="btn-ghost shrink-0 rounded-xl px-4 py-2 text-sm" onClick={() => copy(payee.upiId)} type="button">
                      <Copy size={16} />
                      Copy UPI ID
                    </button>
                  </div>
                </div>
              ) : null}

              <AnimatePresence initial={false}>
                {hasUpi && !item.settled && isOpen ? (
                  <motion.div
                    className="overflow-hidden"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                  >
                    <img alt="UPI QR" className="mt-4 h-32 w-32 rounded-xl border border-zinc-200 sm:h-40 sm:w-40" src={buildQrUrl(upiLink)} />
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
