import { useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { fetchViewSnapshot } from "../api";
import { ExpenseList } from "../components/ExpenseList";
import { LinkNotFoundCard } from "../components/LinkNotFoundCard";
import { ShareCard } from "../components/ShareCard";
import { SettlementList } from "../components/SettlementList";
import { usePollingSnapshot } from "../usePollingSnapshot";
import { money } from "../utils/format";

export function ViewPage() {
  const { id: viewId = "" } = useParams();
  const fetcher = useCallback(() => fetchViewSnapshot(viewId), [viewId]);
  const { snapshot, loading, error } = usePollingSnapshot({ fetcher, enabled: Boolean(viewId) });
  const totalAmountMinor = useMemo(
    () => (snapshot?.expenses || []).reduce((sum, expense) => sum + expense.amountMinor, 0),
    [snapshot?.expenses]
  );

  return (
    <main className="shell max-w-2xl lg:max-w-3xl">
      {snapshot && !error ? (
        <div className="mb-3 reveal sm:mb-4">
          <h1 className="text-lg font-bold text-emerald-950 sm:text-2xl">
            {snapshot.group.name}<span className="text-zinc-500 text-base sm:text-2xl"> (View)</span>
          </h1>
        </div>
      ) : null}

      {loading ? <div className="card mt-3">Loading...</div> : null}
      {error === "Group not found" ? <LinkNotFoundCard /> : null}
      {error && error !== "Group not found" ? <div className="card mt-3 border-red-200 text-red-700">{error}</div> : null}

      {snapshot && !error ? (
        <div className="mt-3 grid gap-3 sm:gap-4">
          <section className="card reveal reveal-1">
            <h2 className="text-base font-semibold text-zinc-900 sm:text-xl">Expense Summary</h2>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:gap-3">
              <div className="rounded-xl border border-zinc-200 bg-white/85 p-2.5 shadow-sm sm:p-3">
                <p className="text-[11px] uppercase tracking-[0.14em] text-zinc-500">Total expenses</p>
                <p className="mt-1 text-sm font-semibold text-zinc-900 sm:text-lg">{snapshot.expenses.length}</p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white/85 p-2.5 shadow-sm sm:p-3">
                <p className="text-[11px] uppercase tracking-[0.14em] text-zinc-500">Total amount</p>
                <p className="mt-1 text-sm font-semibold text-zinc-900 sm:text-lg">
                  {money(totalAmountMinor, snapshot.group.currency)}
                </p>
              </div>
            </div>
          </section>
          <div className="reveal reveal-2">
            <SettlementList
              settlements={snapshot.settlements || []}
              participants={snapshot.participants || []}
              currency={snapshot.group.currency}
              groupName={snapshot.group.name}
              readOnly
            />
          </div>
          <div className="reveal reveal-3">
            <ShareCard
              viewId={snapshot.group.viewId}
              groupName={snapshot.group.name}
              settlements={snapshot.settlements || []}
              currency={snapshot.group.currency}
              hideEditLink
            />
          </div>
          <div className="reveal reveal-4">
            <ExpenseList
              expenses={snapshot.expenses || []}
              participants={snapshot.participants || []}
              currency={snapshot.group.currency}
              onDelete={() => {}}
              canDelete={false}
            />
          </div>
        </div>
      ) : null}
    </main>
  );
}
