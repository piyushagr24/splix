import { useMemo, useState } from "react";
import { CheckCircle2, Copy, ExternalLink, X } from "lucide-react";
import { toast } from "sonner";
import { createGroup } from "../api";

const standardCurrencies = ["AED", "AUD", "BRL", "CAD", "CHF", "CNY", "EUR", "GBP", "HKD", "INR", "JPY", "KRW", "MXN", "NOK", "NZD", "SAR", "SEK", "SGD", "TRY", "USD", "ZAR"];

export function CreateGroupCard() {
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [pin, setPin] = useState("");
  const [participants, setParticipants] = useState(["Person 1", "Person 2"]);
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);

  const canSubmit = useMemo(
    () => name.trim() && /^\d{4}$/.test(pin) && participants.filter((p) => p.trim()).length >= 2,
    [name, pin, participants]
  );

  async function onSubmit(event) {
    event.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    try {
      const cleanParticipants = participants
        .map((participant) => participant.trim())
        .filter((participant) => participant.length > 0)
        .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base", numeric: true }))
        .map((name) => ({ name }));

      const data = await createGroup({
        name: name.trim(),
        currency: currency.trim().toUpperCase(),
        pin,
        participants: cleanParticipants
      });
      setResult(data);
      toast.success("Group created");
    } catch (error) {
      toast.error(error.message || "Failed to create group");
    } finally {
      setSaving(false);
    }
  }

  async function copyLink(path) {
    const url = `${window.location.origin}${path}`;
    await navigator.clipboard.writeText(url);
    toast.success("Link copied");
  }

  function LinkPanel({ label, path }) {
    return (
      <div className="rounded-[1.2rem] border border-emerald-200 bg-white px-3.5 py-3.5 shadow-sm sm:rounded-[1.65rem] sm:px-5 sm:py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">{label}</p>
        <a
          className="mt-2 block break-all text-[13px] text-emerald-700 underline decoration-emerald-300 underline-offset-4 transition hover:text-emerald-800 sm:mt-3 sm:text-[1.05rem]"
          href={path}
          target="_blank"
          rel="noreferrer"
        >
          {path}
        </a>
        <div className="mt-2.5 flex flex-wrap gap-1.5 sm:mt-4 sm:gap-2">
          <button className="btn-ghost rounded-xl px-2.5 py-1 text-[11px] sm:px-4 sm:py-2 sm:text-sm" onClick={() => copyLink(path)} type="button">
            <Copy size={13} />
            Copy
          </button>
          <a className="btn-ghost rounded-xl px-2.5 py-1 text-[11px] sm:px-4 sm:py-2 sm:text-sm" href={path} target="_blank" rel="noreferrer">
            <ExternalLink size={13} />
            Open
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="relative max-w-3xl overflow-hidden rounded-3xl border border-zinc-200 bg-white p-4 shadow-[0_20px_60px_rgba(0,0,0,0.08)] reveal reveal-2 sm:p-5 md:p-6">
      <div className="pointer-events-none absolute -right-24 -top-20 h-48 w-48 rounded-full bg-emerald-500/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-16 h-44 w-44 rounded-full bg-lime-500/10 blur-2xl" />
      <div className="relative flex items-center gap-2">
        <h2 className="text-lg font-semibold text-zinc-900 sm:text-xl">Create Group</h2>
      </div>
      <form className="mt-3.5 grid gap-2.5 sm:mt-4 sm:gap-3" onSubmit={onSubmit}>
        <input className="input text-sm sm:text-base" maxLength={50} placeholder="Group name (e.g. Goa Trip)" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          <select
            className="input text-sm sm:text-base"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            {standardCurrencies.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
          <input
            className="input text-sm sm:text-base"
            placeholder="4-digit PIN"
            maxLength={4}
            inputMode="numeric"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          />
        </div>

        <div className="grid gap-2">
          {participants.map((participant, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                className="input text-sm sm:text-base"
                maxLength={32}
                placeholder={`Participant ${index + 1}`}
                value={participant}
                onChange={(e) =>
                  setParticipants((curr) => curr.map((item, i) => (i === index ? e.target.value : item)))
                }
              />
              <button
                className="btn-ghost p-2 text-xs sm:text-sm"
                type="button"
                disabled={participants.length <= 2}
                onClick={() =>
                  setParticipants((curr) => {
                    if (curr.length <= 2) return curr;
                    return curr.filter((_, i) => i !== index);
                  })
                }
              >
                <X size={16} />
              </button>
            </div>
          ))}
          <button
            className="btn-ghost w-fit rounded-lg px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm"
            type="button"
            onClick={() => setParticipants((curr) => [...curr, `Person ${curr.length + 1}`])}
          >
            Add participant
          </button>
        </div>

        <button className="btn-primary px-4 py-2 text-sm" type="submit" disabled={saving || !canSubmit}>
          {saving ? "Creating...Please Wait." : "Create group"}
        </button>
      </form>

      {result ? (
        <section className="mt-4 rounded-[1.45rem] border border-emerald-300 bg-emerald-50/80 p-3.5 shadow-[0_18px_45px_rgba(16,185,129,0.12)] sm:mt-6 sm:rounded-[1.9rem] sm:p-5">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 sm:h-7 sm:w-7">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-900 sm:text-lg">Links generated</h3>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-emerald-800 sm:text-sm">
            Use Edit to manage expenses. Share View for read-only access.
          </p>
          <div className="mt-2 grid gap-1.5 sm:gap-2">
            <LinkPanel label="Edit link" path={result.editLink} />
            <LinkPanel label="View link" path={result.viewLink} />
          </div>
        </section>
      ) : null}
    </div>
  );
}
