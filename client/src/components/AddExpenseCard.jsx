import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { sortByName } from "../utils/sort";

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
  onAdd,
  disabled,
  adding
}) {
  const sortedParticipants = sortByName(participants);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [paidByParticipantId, setPaidByParticipantId] = useState(defaultPayerId || "");
  const [mode, setMode] = useState("even");
  const [selectedIds, setSelectedIds] = useState([]);
  const [amountMap, setAmountMap] = useState({});
  const [percentMap, setPercentMap] = useState({});
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [amountError, setAmountError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const knownParticipantIdsRef = useRef([]);

  useEffect(() => {
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
  }, [participants]);

  useEffect(() => {
    if (defaultPayerId) {
      setPaidByParticipantId(defaultPayerId);
    }
  }, [defaultPayerId]);

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

    await onAdd({
      title: title.trim(),
      amountMinor,
      paidByParticipantId,
      split: { mode, entries: splitEntries },
      splitJson
    });

    setTitle("");
    setAmount("");
    setPaidByParticipantId(defaultPayerId || "");
    setSelectedIds(sortedParticipants.map((participant) => participant.id));
    setAmountMap({});
    setPercentMap({});
    setDetailsOpen(false);
    setAmountError("");
    setFieldErrors({});
  }

  return (
    <motion.section
      className="card reveal reveal-2"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
    >
      <h2 className="text-base font-semibold text-zinc-900 sm:text-xl">Add Expense</h2>

      <form className="mt-4 grid gap-3 sm:mt-5 sm:gap-4" onSubmit={submit}>
        <div className="grid gap-2.5 md:grid-cols-3 md:gap-3">
          <input className="input h-10 text-xs sm:h-12 sm:text-base" maxLength={60} placeholder="Title" value={title} onChange={(event) => setTitle(event.target.value)} />
          <div>
            <input
              className="input h-10 text-xs sm:h-12 sm:text-base"
              inputMode="decimal"
              placeholder={`Amount (${currency})`}
              value={amount}
              onChange={(event) => {
                const value = event.target.value;
                setAmount(value);
                setAmountError(value === "" || isNumericDraft(value) ? "" : "Use numbers only");
              }}
            />
            {amountError ? <p className="mt-1 text-[11px] text-rose-600 sm:text-xs">{amountError}</p> : null}
          </div>
          <select
            className="input h-10 text-xs sm:h-12 sm:text-base"
            value={paidByParticipantId}
            onChange={(event) => setPaidByParticipantId(event.target.value)}
          >
            {sortedParticipants.map((participant) => (
              <option key={participant.id} value={participant.id}>
                {participant.name} paid
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-2xl border border-zinc-200 p-3 sm:p-4">
          <p className="text-xs font-medium text-zinc-900 sm:text-sm">Split Type</p>
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-zinc-900 sm:gap-4 sm:text-sm">
            <label className="flex items-center gap-2">
              <input checked={mode === "even"} name="splitMode" onChange={() => setMode("even")} type="radio" />
              Even
            </label>
            <label className="flex items-center gap-2">
              <input checked={mode === "amount"} name="splitMode" onChange={() => setMode("amount")} type="radio" />
              Uneven (Amount)
            </label>
            <label className="flex items-center gap-2">
              <input checked={mode === "percentage"} name="splitMode" onChange={() => setMode("percentage")} type="radio" />
              Uneven (Percentage)
            </label>
          </div>

          <div className="mt-4 sm:mt-5">
            <button
              className="inline-flex items-center gap-2 text-xs font-medium text-zinc-900 sm:text-sm"
              onClick={() => setDetailsOpen((current) => !current)}
              type="button"
            >
              {detailsOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              Select Participants in this Split
            </button>
            {detailsOpen ? (
              <div className="mt-3 grid gap-2.5 md:grid-cols-2 md:gap-3">
                  {sortedParticipants.map((participant) => {
                    const checked = selectedIds.includes(participant.id);
                    return (
                      <div key={participant.id} className="rounded-xl border border-zinc-200 px-3 py-2">
                        <label className="flex items-center gap-2.5 text-xs text-zinc-900 sm:gap-3 sm:text-base">
                          <input checked={checked} onChange={() => toggleParticipant(participant.id)} type="checkbox" />
                          <span>{participant.name}</span>
                        </label>
                        {checked && mode !== "even" ? (
                          <>
                            <input
                              className="input mt-2.5 text-sm sm:mt-3 sm:text-base"
                              inputMode="decimal"
                              placeholder={mode === "amount" ? "Share amount" : "Share %"}
                              value={mode === "amount" ? amountMap[participant.id] || "" : percentMap[participant.id] || ""}
                              onChange={(event) => {
                                if (mode === "amount") {
                                  updateNumericField(
                                    event.target.value,
                                    (value) => setAmountMap((current) => ({ ...current, [participant.id]: value })),
                                    `amount-${participant.id}`,
                                    "Use numbers only"
                                  );
                                  return;
                                }
                                updateNumericField(
                                  event.target.value,
                                  (value) => setPercentMap((current) => ({ ...current, [participant.id]: value })),
                                  `percent-${participant.id}`,
                                  "Use numbers only"
                                );
                              }}
                            />
                            {fieldErrors[mode === "amount" ? `amount-${participant.id}` : `percent-${participant.id}`] ? (
                              <p className="mt-1 text-[11px] text-rose-600 sm:text-xs">
                                {fieldErrors[mode === "amount" ? `amount-${participant.id}` : `percent-${participant.id}`]}
                              </p>
                            ) : null}
                          </>
                        ) : null}
                      </div>
                    );
                  })}
              </div>
            ) : null}
          </div>
        </div>

        <button className="btn-primary w-fit rounded-xl px-4 py-2 text-xs font-semibold sm:text-sm" disabled={disabled || adding} type="submit">
          {adding ? "Adding..." : "Add"}
        </button>
      </form>
    </motion.section>
  );
}
