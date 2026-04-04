import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { formatDateTime, money } from "../utils/format";

export function ExpenseList({ expenses, participants, currency, onDelete, canDelete }) {
  const byId = new Map(participants.map((participant) => [participant.id, participant]));
  const [openId, setOpenId] = useState("");

  const orderedExpenses = useMemo(
    () =>
      expenses
        .slice()
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [expenses]
  );

  return (
    <section className="space-y-3 reveal reveal-4">
      <h2 className="text-base font-semibold text-zinc-900 sm:text-xl">Expense Log</h2>
      {!orderedExpenses.length ? <div className="text-zinc-600">No expenses yet.</div> : null}

      {orderedExpenses.map((expense) => {
        const isOpen = openId === expense.id;
        const payerName = byId.get(expense.paidByParticipantId)?.name || "Unknown";
        return (
          <div key={expense.id} className="rounded-2xl border border-zinc-200 bg-white p-2.5 shadow-sm transition duration-300 hover:shadow-md sm:p-3">
            <div className="flex items-start justify-between gap-3">
              <button
                className="flex flex-1 items-start gap-2 text-left"
                onClick={() => setOpenId(isOpen ? "" : expense.id)}
                type="button"
              >
                {isOpen ? <ChevronDown size={16} className="mt-0.5 shrink-0 text-zinc-500 sm:mt-1" /> : <ChevronRight size={16} className="mt-0.5 shrink-0 text-zinc-500 sm:mt-1" />}
                <div className="text-xs text-zinc-900 sm:text-sm">
                  {expense.title} {"\u00b7"} {money(expense.amountMinor, currency)} {"\u00b7"} {payerName} {"\u00b7"} {formatDateTime(expense.createdAt)}
                  {expense.__pending ? <span className="ml-2 text-xs text-zinc-500 sm:text-sm">(syncing...)</span> : null}
                </div>
              </button>
              {canDelete && !expense.__pending ? (
                <button className="btn-ghost rounded-xl p-1.5 sm:p-2" onClick={() => onDelete(expense.id)} type="button">
                  <Trash2 size={15} />
                </button>
              ) : null}
            </div>

            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  className="overflow-hidden"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                >
                  <div className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50/70 p-3 sm:mt-4 sm:p-4">
                    <p className="text-xs font-medium text-zinc-900 sm:text-sm">Split details</p>
                    <div className="mt-2.5 space-y-1 text-xs text-zinc-700 sm:mt-3 sm:text-sm">
                      {Object.entries(expense.splitJson || {})
                        .sort((a, b) => {
                          const aName = byId.get(a[0])?.name || "";
                          const bName = byId.get(b[0])?.name || "";
                          return aName.localeCompare(bName, undefined, { sensitivity: "base", numeric: true });
                        })
                        .map(([participantId, value]) => (
                          <p key={participantId}>
                            {byId.get(participantId)?.name || "Unknown"}: {money(value, currency)}
                          </p>
                        ))}
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </section>
  );
}
