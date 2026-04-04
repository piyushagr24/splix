import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ParticipantProfileCard({
  participant,
  saving,
  isOpen,
  onToggle,
  onChangePerson,
  onSave
}) {
  const [upiId, setUpiId] = useState(participant?.upiId || "");

  useEffect(() => {
    setUpiId(participant?.upiId || "");
  }, [participant?.id, participant?.upiId]);

  if (!participant) return null;

  const profileState = participant.upiId ? "UPI added" : "Add UPI to receive direct payments";

  return (
    <section className="card reveal reveal-1">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-zinc-900 sm:text-base">You are: {participant.name}</p>
          <p className="mt-1 text-[11px] text-zinc-600 sm:text-xs">{profileState}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-ghost rounded-lg px-2.5 py-1.5 text-xs font-medium sm:px-3 sm:py-2 sm:text-sm" onClick={onToggle} type="button">
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            {isOpen ? "Hide Profile" : "Show Profile"}
          </button>
          <button className="btn-ghost rounded-lg px-2.5 py-1.5 text-xs font-medium sm:px-3 sm:py-2 sm:text-sm" onClick={onChangePerson} type="button">
            Change Person
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            className="overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <div className="mt-3 grid gap-2.5 md:grid-cols-[1fr_240px] md:gap-3">
              <input
                className="input text-sm sm:text-base"
                placeholder="UPI ID (optional)"
                value={upiId}
                onChange={(event) => setUpiId(event.target.value)}
              />
              <button className="btn-ghost rounded-xl py-2 text-xs sm:py-3 sm:text-base" disabled={saving} onClick={() => onSave(upiId)} type="button">
                {saving ? "Saving..." : "Save UPI"}
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
