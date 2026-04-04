import { sortByName } from "../utils/sort";

export function IdentitySelectorCard({ participants, selectedId, onSelect, description }) {
  return (
    <div className="card reveal reveal-2">
      <h3 className="text-base font-semibold text-zinc-900 sm:text-lg">Who are you?</h3>
      <p className="mt-1 text-xs text-zinc-600 sm:text-sm">
        {description || "Required in edit mode before adding expenses or editing profile."}
      </p>
      <div className="mt-3 grid gap-2">
        {sortByName(participants).map((participant) => (
          <button
            key={participant.id}
            className={selectedId === participant.id ? "btn-primary justify-start px-3 py-2 text-xs sm:text-sm" : "btn-ghost justify-start px-3 py-2 text-xs sm:text-sm"}
            onClick={() => onSelect(participant.id)}
            type="button"
          >
            {participant.name}
          </button>
        ))}
      </div>
    </div>
  );
}
