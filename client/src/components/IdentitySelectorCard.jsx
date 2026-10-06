import { UserCheck } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { sortByName } from "@/utils/sort";

export function IdentitySelectorCard({ participants = [], selectedId, onSelect, description }) {
  return (
    <div className="mx-auto max-w-md rounded-3xl border border-zinc-200 bg-white/95 p-6 shadow-xl backdrop-blur-xl">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 mb-3">
        <UserCheck className="h-6 w-6" />
      </div>
      <h2 className="text-xl font-bold text-center text-zinc-900">Who are you?</h2>
      <p className="mt-1 text-center text-xs sm:text-sm text-zinc-500">
        {description || "Select your name from the group to personalize your balance and expenses."}
      </p>

      <div className="mt-5 grid grid-cols-1 gap-2">
        {sortByName(participants).map((participant) => {
          const isSelected = selectedId === participant.id;
          return (
            <button
              key={participant.id}
              type="button"
              onClick={() => onSelect(participant.id)}
              className={`flex items-center gap-3 w-full rounded-2xl border p-3.5 text-left transition-all ${
                isSelected
                  ? "border-emerald-500 bg-emerald-50/80 text-emerald-950 ring-2 ring-emerald-500/20"
                  : "border-zinc-200 bg-white hover:border-emerald-300 hover:bg-zinc-50"
              }`}
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback className="text-xs font-semibold bg-emerald-100 text-emerald-800">
                  {participant.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-zinc-900 truncate">{participant.name}</p>
                <p className="text-xs text-zinc-500">
                  {participant.upiId ? "UPI configured" : "No UPI yet"}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
