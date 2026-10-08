import { useState } from "react";
import { UserCheck, UserPlus, ChevronRight, Check, Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { sortByName } from "@/utils/sort";
import { cn } from "@/lib/utils";

const AVATAR_PALETTES = [
  "bg-emerald-100 text-emerald-800 border-emerald-200/80",
  "bg-sky-100 text-sky-800 border-sky-200/80",
  "bg-violet-100 text-violet-800 border-violet-200/80",
  "bg-amber-100 text-amber-800 border-amber-200/80",
  "bg-rose-100 text-rose-800 border-rose-200/80",
  "bg-indigo-100 text-indigo-800 border-indigo-200/80",
  "bg-teal-100 text-teal-800 border-teal-200/80",
  "bg-orange-100 text-orange-800 border-orange-200/80",
  "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200/80"
];

function getAvatarColor(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length];
}

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function IdentitySelectorCard({
  groupName,
  participants = [],
  selectedId,
  onSelect,
  onAddParticipant,
  description
}) {
  const [search, setSearch] = useState("");
  const sorted = sortByName(participants);

  const filtered = search.trim()
    ? sorted.filter((p) => p.name.toLowerCase().includes(search.toLowerCase().trim()))
    : sorted;

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-zinc-200/90 bg-white/95 p-6 sm:p-7 shadow-xl shadow-zinc-950/5 backdrop-blur-xl">
      {/* Icon Badge */}
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100/90 text-emerald-800 border border-emerald-200/60 shadow-sm mb-3">
        <UserCheck className="h-6 w-6" />
      </div>

      {/* Unified Heading */}
      <h2 className="text-xl sm:text-2xl font-bold text-center text-zinc-900 tracking-tight">
        Who are you?
      </h2>

      {/* Subtitle with Context */}
      <p className="mt-1.5 text-center text-xs sm:text-sm text-zinc-500 max-w-xs mx-auto leading-relaxed">
        {groupName ? (
          <>
            Welcome to{" "}
            <span className="font-semibold text-zinc-800 break-words [overflow-wrap:anywhere]">
              {groupName}
            </span>
            ! Select your name to continue.
          </>
        ) : (
          description || "Select your name from the group to continue."
        )}
      </p>

      {/* Search filter if 6+ members */}
      {participants.length >= 6 && (
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-zinc-200 bg-zinc-50/60 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
      )}

      {/* Participant List */}
      <div className="mt-5 space-y-2 max-h-[340px] overflow-y-auto pr-0.5">
        {filtered.map((participant) => {
          const isSelected = selectedId === participant.id;
          const avatarColor = getAvatarColor(participant.name);

          return (
            <button
              key={participant.id}
              type="button"
              onClick={() => onSelect(participant.id)}
              className={cn(
                "group flex items-center justify-between w-full rounded-2xl border p-3 sm:p-3.5 text-left transition-all duration-150 active:scale-[0.99]",
                isSelected
                  ? "border-emerald-500 bg-emerald-50/80 text-emerald-950 ring-2 ring-emerald-500/20 shadow-sm"
                  : "border-zinc-200/80 bg-white hover:border-emerald-300 hover:bg-emerald-50/30 hover:shadow-sm"
              )}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className={cn("text-xs font-bold border", avatarColor)}>
                    {getInitials(participant.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-zinc-900 truncate group-hover:text-emerald-950">
                    {participant.name}
                  </p>
                  {participant.upiId && (
                    <p className="text-[11px] font-mono text-emerald-700 truncate">
                      {participant.upiId}
                    </p>
                  )}
                </div>
              </div>

              <div className="shrink-0 pl-2">
                {isSelected ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white">
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </div>
                ) : (
                  <ChevronRight className="h-4 w-4 text-zinc-300 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-emerald-600" />
                )}
              </div>
            </button>
          );
        })}

        {filtered.length === 0 && (
          <p className="text-center py-4 text-xs text-zinc-400">
            No member found matching &ldquo;{search}&rdquo;
          </p>
        )}
      </div>

      {/* "Not on the list? Add your name" Option */}
      {onAddParticipant && (
        <button
          type="button"
          onClick={onAddParticipant}
          className="mt-3.5 flex items-center justify-center gap-2 w-full rounded-2xl border border-dashed border-zinc-200 py-3 text-xs font-semibold text-zinc-600 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50/40 transition-all active:scale-[0.99]"
        >
          <UserPlus className="h-3.5 w-3.5 text-zinc-500" />
          <span>Not on the list? Add your name</span>
        </button>
      )}
    </div>
  );
}
