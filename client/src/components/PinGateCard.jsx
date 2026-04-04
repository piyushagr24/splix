import { useState } from "react";

export function PinGateCard({ onSubmit, loading }) {
  const [pin, setPin] = useState("");

  return (
    <section className="reveal reveal-2 mx-auto max-w-md rounded-2xl border border-zinc-900/12 bg-white/90 p-4 shadow-sm sm:p-5">
      <h2 className="text-base font-semibold text-zinc-900 sm:text-lg">Enter Group PIN</h2>
      <p className="mt-1 text-xs text-zinc-700 sm:text-sm">This edit link is protected. Enter the 4-digit PIN to continue.</p>
      <form
        className="mt-3 grid gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(pin);
        }}
      >
        <input
          className="input text-sm tracking-[0.32em] sm:text-lg"
          value={pin}
          maxLength={4}
          inputMode="numeric"
          placeholder="0000"
          onChange={(event) => setPin(event.target.value.replace(/\D/g, ""))}
        />
        <button className="btn-primary px-4 py-2 text-xs sm:text-sm" disabled={loading || pin.length !== 4} type="submit">
          {loading ? "Unlocking..." : "Unlock edit access"}
        </button>
      </form>
    </section>
  );
}
