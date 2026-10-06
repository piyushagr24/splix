import { useState } from "react";
import { Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PinGateCard({ onSubmit, loading }) {
  const [pin, setPin] = useState("");

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-zinc-200 bg-white/95 p-6 shadow-xl backdrop-blur-xl">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 mb-3">
        <Lock className="h-6 w-6" />
      </div>
      <h2 className="text-xl font-bold text-center text-zinc-900">Protected Group</h2>
      <p className="mt-1 text-center text-xs sm:text-sm text-zinc-500">
        Enter the 4-digit PIN set when this group was created to unlock edit access.
      </p>

      <form
        className="mt-6 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (pin.length === 4) {
            onSubmit(pin);
          }
        }}
      >
        <div>
          <Input
            autoFocus
            className="h-14 text-center font-mono text-2xl tracking-[0.5em] font-bold rounded-2xl"
            value={pin}
            maxLength={4}
            inputMode="numeric"
            placeholder="••••"
            onChange={(event) => setPin(event.target.value.replace(/\D/g, ""))}
          />
        </div>

        <Button
          type="submit"
          className="w-full h-11 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
          disabled={loading || pin.length !== 4}
        >
          {loading ? "Verifying PIN..." : "Unlock Group"}
        </Button>

        <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>7-day session token stored locally</span>
        </div>
      </form>
    </div>
  );
}
