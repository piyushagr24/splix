import { useCallback, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  addExpense,
  createSession,
  deleteExpense,
  fetchEditSnapshot,
  updateSettlement,
  updateParticipant
} from "../api";
import { AddExpenseCard } from "../components/AddExpenseCard";
import { ExpenseList } from "../components/ExpenseList";
import { IdentitySelectorCard } from "../components/IdentitySelectorCard";
import { LinkNotFoundCard } from "../components/LinkNotFoundCard";
import { ParticipantProfileCard } from "../components/ParticipantProfileCard";
import { PinGateCard } from "../components/PinGateCard";
import { ShareCard } from "../components/ShareCard";
import { SettlementList } from "../components/SettlementList";
import { usePollingSnapshot } from "../usePollingSnapshot";
import { deriveBalances, simplifyDebts } from "../utils/settlement";
import { identityKey, tokenKey } from "../utils/storage";

export function EditPage() {
  const { id: editId = "" } = useParams();
  const [token, setToken] = useState(() => localStorage.getItem(tokenKey(editId)) || "");
  const [selectedParticipantId, setSelectedParticipantId] = useState(
    () => localStorage.getItem(identityKey(editId)) || ""
  );
  const [unlocking, setUnlocking] = useState(false);
  const [adding, setAdding] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [missingLink, setMissingLink] = useState(false);
  const [pendingExpenses, setPendingExpenses] = useState([]);
  const [optimisticRemovedIds, setOptimisticRemovedIds] = useState([]);

  const fetcher = useCallback(() => fetchEditSnapshot(editId, token), [editId, token]);
  const { snapshot, loading, error, refetch } = usePollingSnapshot({
    enabled: Boolean(token),
    fetcher
  });

  const participants = snapshot?.participants || [];
  const expensesFromServer = snapshot?.expenses || [];
  const optimisticVisible = useMemo(
    () => pendingExpenses.filter((item) => !expensesFromServer.some((expense) => expense.id === item.id)),
    [pendingExpenses, expensesFromServer]
  );
  const visibleExpenses = [...optimisticVisible, ...expensesFromServer].filter(
    (expense) => !optimisticRemovedIds.includes(expense.id)
  );
  const orderedParticipants = participants
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base", numeric: true }));
  const settlements = useMemo(
    () => {
      const serverStates = new Map(
        (snapshot?.settlements || []).map((item) => [
          `${item.fromParticipantId}|${item.toParticipantId}|${item.amountMinor}`,
          Boolean(item.settled)
        ])
      );

      return simplifyDebts(deriveBalances(orderedParticipants, visibleExpenses)).map((item) => ({
        ...item,
        settled: serverStates.get(`${item.fromParticipantId}|${item.toParticipantId}|${item.amountMinor}`) || false
      }));
    },
    [orderedParticipants, visibleExpenses, snapshot?.settlements]
  );
  const selectedParticipant = participants.find((item) => item.id === selectedParticipantId) || null;

  async function unlock(pin) {
    setUnlocking(true);
    try {
      const data = await createSession({ editId, pin });
      localStorage.setItem(tokenKey(editId), data.token);
      setToken(data.token);
      setMissingLink(false);
      toast.success("Unlocked");
    } catch (err) {
      if (err.message === "Group not found") {
        setMissingLink(true);
        return;
      }
      toast.error(err.message || "Invalid PIN");
    } finally {
      setUnlocking(false);
    }
  }

  if (missingLink) {
    return (
      <main className="shell max-w-2xl lg:max-w-3xl">
        <LinkNotFoundCard />
      </main>
    );
  }

  function selectIdentity(participantId) {
    localStorage.setItem(identityKey(editId), participantId);
    setSelectedParticipantId(participantId);
  }

  async function onAdd(payload) {
    if (!token) return;
    const tempExpense = {
      id: `temp-${Date.now()}`,
      title: payload.title,
      amountMinor: payload.amountMinor,
      paidByParticipantId: payload.paidByParticipantId,
      splitJson: payload.splitJson || {},
      notes: payload.notes || null,
      createdAt: new Date().toISOString(),
      __pending: true
    };
    setAdding(true);
    setPendingExpenses((curr) => [tempExpense, ...curr]);
    try {
      const created = await addExpense(editId, token, payload);
      setPendingExpenses((curr) => curr.filter((item) => item.id !== tempExpense.id));
      setPendingExpenses((curr) => [created, ...curr]);
      toast.success("Expense added");
      await refetch();
      setPendingExpenses((curr) => curr.filter((item) => item.id !== created.id));
    } catch (err) {
      setPendingExpenses((curr) => curr.filter((item) => item.id !== tempExpense.id));
      toast.error(err.message || "Failed to add expense");
    } finally {
      setAdding(false);
    }
  }

  async function onDelete(expenseId) {
    if (!token) return;
    setOptimisticRemovedIds((curr) => [...curr, expenseId]);
    try {
      await deleteExpense(editId, expenseId, token);
      toast.success("Expense deleted");
      await refetch();
      setOptimisticRemovedIds((curr) => curr.filter((item) => item !== expenseId));
    } catch (err) {
      setOptimisticRemovedIds((curr) => curr.filter((item) => item !== expenseId));
      toast.error(err.message || "Delete failed");
    }
  }

  async function saveProfile(upiId) {
    if (!token || !selectedParticipantId) return;
    setSavingProfile(true);
    try {
      await updateParticipant(editId, selectedParticipantId, token, { upiId });
      toast.success("Profile saved");
      await refetch();
    } catch (err) {
      toast.error(err.message || "Failed to save profile");
    } finally {
      setSavingProfile(false);
    }
  }

  async function toggleSettlement(row) {
    if (!token) return;
    try {
      await updateSettlement(editId, token, {
        fromParticipantId: row.fromParticipantId,
        toParticipantId: row.toParticipantId,
        amountMinor: row.amountMinor,
        settled: !row.settled
      });
      toast.success(row.settled ? "Marked as unsettled" : "Marked as settled");
      await refetch();
    } catch (err) {
      toast.error(err.message || "Failed to update settlement");
    }
  }

  if (!token) {
    return (
      <main className="shell max-w-2xl lg:max-w-3xl">
        <h1 className="mb-2 mt-1 text-xl font-bold text-emerald-950 reveal reveal-1 sm:mb-3 sm:text-3xl">Edit Link</h1>
        <PinGateCard onSubmit={unlock} loading={unlocking} />
      </main>
    );
  }

  if (loading && !snapshot) {
    return (
      <main className="shell max-w-2xl lg:max-w-3xl">
        <div className="card">Loading...</div>
      </main>
    );
  }

  if (error && !snapshot) {
    if (error === "Group not found") {
      return (
        <main className="shell max-w-2xl lg:max-w-3xl">
          <LinkNotFoundCard />
        </main>
      );
    }
    return (
      <main className="shell max-w-2xl lg:max-w-3xl">
        <div className="card border-red-200 text-red-700">{error}</div>
      </main>
    );
  }

  if (snapshot && (!selectedParticipantId || !participants.find((item) => item.id === selectedParticipantId))) {
    return (
      <main className="shell max-w-2xl lg:max-w-3xl">
        <header className="reveal">
          <h1 className="text-lg font-bold text-zinc-900 sm:text-2xl">
            {snapshot.group.name} <span className="text-zinc-500">(Edit)</span>
          </h1>
        </header>
        <div className="mx-auto mt-5 max-w-xl sm:mt-8">
          <IdentitySelectorCard
            participants={orderedParticipants}
            selectedId={selectedParticipantId}
            onSelect={selectIdentity}
            description="Select your name before the edit dashboard is unlocked."
          />
        </div>
      </main>
    );
  }

  return (
      <main className="shell max-w-2xl lg:max-w-3xl">
      {snapshot ? (
        <div className="space-y-4 sm:space-y-6">
          <header className="reveal">
            <h1 className="text-lg font-bold text-zinc-900 sm:text-2xl">
              {snapshot.group.name} <span className="text-zinc-500">(Edit)</span>
            </h1>
          </header>

          <ParticipantProfileCard
            participant={selectedParticipant}
            saving={savingProfile}
            isOpen={profileOpen}
            onToggle={() => setProfileOpen((current) => !current)}
            onChangePerson={() => {
              localStorage.removeItem(identityKey(editId));
              setSelectedParticipantId("");
            }}
            onSave={saveProfile}
          />

          <AddExpenseCard
            participants={orderedParticipants}
            currency={snapshot.group.currency}
            defaultPayerId={selectedParticipantId}
            onAdd={onAdd}
            disabled={!selectedParticipantId}
            adding={adding}
          />

          <SettlementList
            settlements={settlements}
            participants={orderedParticipants}
            currency={snapshot.group.currency}
            groupName={snapshot.group.name}
            onToggleSettled={toggleSettlement}
            readOnly={false}
          />

          <ShareCard
            editId={snapshot.group.editId}
            viewId={snapshot.group.viewId}
            groupName={snapshot.group.name}
            settlements={settlements}
            currency={snapshot.group.currency}
          />

          <ExpenseList
            expenses={visibleExpenses}
            participants={orderedParticipants}
            currency={snapshot.group.currency}
            onDelete={onDelete}
            canDelete={Boolean(selectedParticipantId)}
          />
        </div>
      ) : null}
    </main>
  );
}
