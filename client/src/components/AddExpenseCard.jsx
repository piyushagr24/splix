import { useEffect, useRef, useState } from "react";
import {
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Layers,
  Percent,
  Plus,
  Save,
  Users,
  Wallet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { sortByName } from "@/utils/sort";
import { CATEGORIES, getCategory } from "@/utils/categories";

function isNumericDraft(value) {
  return /^\d*\.?\d*$/.test(value);
}

function toMinor(value) {
  const num = Number(value || 0);
  return Number.isFinite(num) ? Math.round(num * 100) : 0;
}

function buildClientSplitJson({ amountMinor, mode, selectedIds, amountMap, percentMap }) {
  if (mode === "even") {
    const base = Math.floor(amountMinor / selectedIds.length);
    let remainder = amountMinor - base * selectedIds.length;
    const result = {};
    for (const participantId of selectedIds) {
      const extra = remainder > 0 ? 1 : 0;
      result[participantId] = base + extra;
      if (remainder > 0) remainder -= 1;
    }
    return result;
  }

  if (mode === "amount") {
    return Object.fromEntries(
      selectedIds.map((participantId) => [participantId, toMinor(amountMap[participantId] || 0)])
    );
  }

  const rows = selectedIds.map((participantId) => ({
    participantId,
    raw: (amountMinor * Number(percentMap[participantId] || 0)) / 100
  }));
  const result = {};
  let allocated = 0;

  for (const row of rows) {
    const floorValue = Math.floor(row.raw);
    result[row.participantId] = floorValue;
    allocated += floorValue;
  }

  let remainder = amountMinor - allocated;
  rows
    .slice()
    .sort((a, b) => (b.raw - Math.floor(b.raw)) - (a.raw - Math.floor(a.raw)))
    .forEach((row) => {
      if (remainder <= 0) return;
      result[row.participantId] += 1;
      remainder -= 1;
    });

  return result;
}

export function AddExpenseCard({
  participants,
  currency,
  defaultPayerId,
  initialExpense = null,
  onAdd,
  onUpdate,
  disabled,
  adding,
  onSuccess,
  onCancel
}) {
  const sortedParticipants = sortByName(participants);
  const isEditMode = Boolean(initialExpense);

  const [title, setTitle] = useState(initialExpense?.title || "");
  const [amount, setAmount] = useState(
    initialExpense ? (initialExpense.amountMinor / 100).toFixed(2).replace(/\.00$/, "") : ""
  );
  const [paidByParticipantId, setPaidByParticipantId] = useState(
    initialExpense?.paidByParticipantId || defaultPayerId || ""
  );
  const [category, setCategory] = useState(initialExpense?.category || "general");
  const [date, setDate] = useState(
    initialExpense?.date
      ? initialExpense.date.slice(0, 10)
      : new Date().toISOString().slice(0, 10)
  );

  const [mode, setMode] = useState("even");
  const [selectedIds, setSelectedIds] = useState([]);
  const [amountMap, setAmountMap] = useState({});
  const [percentMap, setPercentMap] = useState({});
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [amountError, setAmountError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const knownParticipantIdsRef = useRef([]);

  useEffect(() => {
    if (initialExpense) {
      setTitle(initialExpense.title || "");
      setAmount((initialExpense.amountMinor / 100).toFixed(2).replace(/\.00$/, ""));
      setPaidByParticipantId(initialExpense.paidByParticipantId || defaultPayerId || "");
      setCategory(initialExpense.category || "general");
      setDate(
        initialExpense.date
          ? initialExpense.date.slice(0, 10)
          : new Date().toISOString().slice(0, 10)
      );

      const splitKeys = Object.keys(initialExpense.splitJson || {});
      if (splitKeys.length > 0) {
        setSelectedIds(splitKeys);
        // Pre-fill amountMap
        const newAmountMap = {};
        for (const [pId, shareMinor] of Object.entries(initialExpense.splitJson)) {
          newAmountMap[pId] = (shareMinor / 100).toFixed(2);
        }
        setAmountMap(newAmountMap);
      }
    }
  }, [initialExpense, defaultPayerId]);

  useEffect(() => {
    if (isEditMode) return;
    const participantIds = sortedParticipants.map((participant) => participant.id);
    const previousIds = knownParticipantIdsRef.current;
    const previousIdSet = new Set(previousIds);

    setSelectedIds((current) => {
      if (!current.length) return participantIds;
      const participantIdSet = new Set(participantIds);
      const retained = current.filter((id) => participantIdSet.has(id));
      const added = participantIds.filter((id) => !previousIdSet.has(id));
      return [...retained, ...added];
    });

    knownParticipantIdsRef.current = participantIds;
  }, [participants, isEditMode]);

  useEffect(() => {
    if (!isEditMode && defaultPayerId && !paidByParticipantId) {
      setPaidByParticipantId(defaultPayerId);
    }
  }, [defaultPayerId, isEditMode, paidByParticipantId]);

  useEffect(() => {
    setDetailsOpen(mode !== "even");
  }, [mode]);

  function toggleParticipant(participantId) {
    setSelectedIds((current) =>
      current.includes(participantId)
        ? current.filter((item) => item !== participantId)
        : [...current, participantId]
    );
  }

  function selectAll() {
    setSelectedIds(sortedParticipants.map((p) => p.id));
  }

  function updateNumericField(value, setter, errorKey, message) {
    setter(value);
    setFieldErrors((current) => {
      const next = { ...current };
      if (value === "" || isNumericDraft(value)) {
        delete next[errorKey];
      } else {
        next[errorKey] = message;
      }
      return next;
    });
  }

  async function submit(event) {
    event.preventDefault();
    const amountMinor = toMinor(amount);
    if (!title.trim() || amountMinor <= 0 || !paidByParticipantId || selectedIds.length === 0) return;

    const splitEntries = selectedIds.map((participantId) => ({
      participantId,
      amountMinor: mode === "amount" ? toMinor(amountMap[participantId] || 0) : undefined,
      percent: mode === "percentage" ? Number(percentMap[participantId] || 0) : undefined
    }));
    const splitJson = buildClientSplitJson({
      amountMinor,
      mode,
      selectedIds,
      amountMap,
      percentMap
    });

    const payload = {
      title: title.trim(),
      amountMinor,
      paidByParticipantId,
      category,
      date: date ? new Date(date).toISOString() : new Date().toISOString(),
      split: { mode, entries: splitEntries },
      splitJson
    };

    if (isEditMode && onUpdate) {
      await onUpdate(initialExpense.id, payload);
    } else {
      await onAdd(payload);
    }

    if (!isEditMode) {
      setTitle("");
      setAmount("");
      setPaidByParticipantId(defaultPayerId || "");
      setSelectedIds(sortedParticipants.map((p) => p.id));
      setCategory("general");
      setDate(new Date().toISOString().slice(0, 10));
      setAmountMap({});
      setPercentMap({});
      setDetailsOpen(false);
      setAmountError("");
      setFieldErrors({});
    }

    if (onSuccess) {
      onSuccess();
    }
  }

  const perPersonShare =
    mode === "even" && selectedIds.length > 0 && toMinor(amount) > 0
      ? (toMinor(amount) / selectedIds.length / 100).toFixed(2)
      : null;

  return (
    <form className="space-y-4" onSubmit={submit}>
      <div className="space-y-3">
        {/* Title input */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Expense Title
          </label>
          <Input
            autoFocus={!isEditMode}
            className="mt-1 text-sm sm:text-base font-medium"
            maxLength={60}
            placeholder="Dinner, Cab ride, Groceries..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Amount & Currency */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Amount ({currency})
            </label>
            <div className="relative mt-1">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400 font-semibold text-sm">
                {currency}
              </span>
              <Input
                className="pl-14 text-sm sm:text-base font-bold"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  const val = e.target.value;
                  setAmount(val);
                  setAmountError(val === "" || isNumericDraft(val) ? "" : "Numbers only");
                }}
              />
            </div>
            {amountError && <p className="mt-1 text-xs text-rose-600">{amountError}</p>}
          </div>

          {/* Paid by selection */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Paid By
            </label>
            <div className="relative mt-1">
              <select
                className="flex h-11 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-sm font-medium text-zinc-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200"
                value={paidByParticipantId}
                onChange={(e) => setPaidByParticipantId(e.target.value)}
              >
                {sortedParticipants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Category & Date in 2 columns */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Category Picker */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Category
            </label>
            <div className="relative mt-1">
              <select
                className="flex h-11 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-sm font-medium text-zinc-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Expense Date Picker */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Expense Date</span>
            </label>
            <div className="relative mt-1">
              <Input
                type="date"
                className="h-11 text-sm font-medium"
                value={date}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Quick Category Chips */}
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-medium border transition-all ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-500/30 font-semibold"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                }`}
                onClick={() => setCategory(cat.id)}
              >
                <Icon className={`h-3 w-3 ${isSelected ? "text-emerald-700" : "text-zinc-500"}`} />
                <span>{cat.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Split Mode Selector */}
      <div className="rounded-2xl border border-zinc-200/90 bg-zinc-50/70 p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Split Method
          </label>
          {perPersonShare && (
            <Badge variant="success" className="text-[11px]">
              {currency} {perPersonShare} / person
            </Badge>
          )}
        </div>

        <div className="mt-2.5 grid grid-cols-3 gap-1.5 sm:gap-2">
          <button
            type="button"
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-2 text-xs sm:text-sm font-semibold transition-all ${
              mode === "even"
                ? "bg-white text-emerald-800 shadow-sm border border-emerald-300 ring-2 ring-emerald-500/20"
                : "text-zinc-600 hover:bg-white/60"
            }`}
            onClick={() => setMode("even")}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Equally</span>
          </button>
          <button
            type="button"
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-2 text-xs sm:text-sm font-semibold transition-all ${
              mode === "amount"
                ? "bg-white text-emerald-800 shadow-sm border border-emerald-300 ring-2 ring-emerald-500/20"
                : "text-zinc-600 hover:bg-white/60"
            }`}
            onClick={() => setMode("amount")}
          >
            <DollarSign className="h-3.5 w-3.5" />
            <span>By Amount</span>
          </button>
          <button
            type="button"
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-2 text-xs sm:text-sm font-semibold transition-all ${
              mode === "percentage"
                ? "bg-white text-emerald-800 shadow-sm border border-emerald-300 ring-2 ring-emerald-500/20"
                : "text-zinc-600 hover:bg-white/60"
            }`}
            onClick={() => setMode("percentage")}
          >
            <Percent className="h-3.5 w-3.5" />
            <span>By %</span>
          </button>
        </div>

        {/* Participants Selector Toggle */}
        <div className="mt-3.5 border-t border-zinc-200/80 pt-3">
          <div className="flex items-center justify-between">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-700 hover:text-zinc-900"
              onClick={() => setDetailsOpen((c) => !c)}
            >
              <Users className="h-3.5 w-3.5 text-emerald-600" />
              <span>Split across {selectedIds.length} of {sortedParticipants.length} people</span>
              {detailsOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
            {detailsOpen && selectedIds.length !== sortedParticipants.length && (
              <button
                type="button"
                className="text-xs font-semibold text-emerald-700 hover:underline"
                onClick={selectAll}
              >
                Select all
              </button>
            )}
          </div>

          {detailsOpen && (
            <div className="mt-3 grid gap-2 max-h-56 overflow-y-auto pr-1">
              {sortedParticipants.map((p) => {
                const checked = selectedIds.includes(p.id);
                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between rounded-xl border p-2 sm:p-2.5 transition-all ${
                      checked
                        ? "border-emerald-200 bg-white"
                        : "border-zinc-200 bg-zinc-50/50 opacity-60"
                    }`}
                  >
                    <label className="flex flex-1 cursor-pointer items-center gap-2.5 text-xs sm:text-sm font-medium text-zinc-900">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleParticipant(p.id)}
                        className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[10px] bg-emerald-100 text-emerald-800">
                          {p.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{p.name}</span>
                    </label>

                    {checked && mode !== "even" && (
                      <div className="w-28">
                        <Input
                          className="h-8 text-xs font-semibold text-right"
                          inputMode="decimal"
                          placeholder={mode === "amount" ? `${currency} 0.00` : "%"}
                          value={mode === "amount" ? amountMap[p.id] || "" : percentMap[p.id] || ""}
                          onChange={(e) => {
                            if (mode === "amount") {
                              updateNumericField(
                                e.target.value,
                                (val) => setAmountMap((c) => ({ ...c, [p.id]: val })),
                                `amount-${p.id}`,
                                "Numbers only"
                              );
                            } else {
                              updateNumericField(
                                e.target.value,
                                (val) => setPercentMap((c) => ({ ...c, [p.id]: val })),
                                `percent-${p.id}`,
                                "Numbers only"
                              );
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {isEditMode && onCancel && (
          <Button
            type="button"
            variant="outline"
            className="flex-1 h-11 text-sm font-semibold rounded-xl"
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          className="flex-1 h-11 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-md text-white"
          disabled={disabled || adding || !title.trim() || toMinor(amount) <= 0 || selectedIds.length === 0}
        >
          {isEditMode ? (
            <>
              <Save className="h-4 w-4 mr-1.5" />
              {adding ? "Saving Changes..." : "Update Expense"}
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-1" />
              {adding ? "Adding Expense..." : "Add Expense"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
