import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Lock,
  LockOpen,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Check,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function PinGateCard({
  groupMeta,
  metaLoading = false,
  onSubmit,
  loading = false
}) {
  const [pin, setPin] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [forgotOpen, setForgotOpen] = useState(false);

  const inputRef = useRef(null);

  // Auto focus input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  async function attemptSubmit(code) {
    if (loading || isUnlocked) return;
    setErrorMessage("");

    const result = await onSubmit(code);
    if (result && result.ok) {
      setIsUnlocked(true);
    } else {
      setIsShaking(true);
      setErrorMessage(result?.error || "Incorrect PIN. Please try again.");
      setTimeout(() => {
        setIsShaking(false);
        setPin("");
        inputRef.current?.focus();
      }, 450);
    }
  }

  const handlePinChange = async (event) => {
    const cleaned = event.target.value.replace(/\D/g, "").slice(0, 4);
    setPin(cleaned);
    if (errorMessage) {
      setErrorMessage("");
    }

    // Auto submit upon entering 4 digits
    if (cleaned.length === 4) {
      await attemptSubmit(cleaned);
    }
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  const digits = [0, 1, 2, 3];

  return (
    <>
      <div
        className={cn(
          "mx-auto max-w-sm rounded-3xl border border-zinc-200/90 bg-white/95 p-6 sm:p-7 shadow-xl shadow-zinc-950/5 backdrop-blur-xl transition-all duration-300",
          isShaking && "animate-shake"
        )}
      >
        {/* Proportional Lock Icon Container */}
        <div
          className={cn(
            "mx-auto flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm border transition-all duration-300 mb-3",
            isUnlocked
              ? "bg-emerald-600 text-white border-emerald-500 scale-105 shadow-emerald-600/20"
              : "bg-emerald-100/90 text-emerald-800 border-emerald-200/60"
          )}
        >
          {isUnlocked ? (
            <LockOpen className="h-6 w-6 animate-in zoom-in-75 duration-200" />
          ) : loading ? (
            <Loader2 className="h-6 w-6 animate-spin text-emerald-800" />
          ) : (
            <Lock className="h-6 w-6 text-emerald-800" />
          )}
        </div>

        {/* Dynamic Title (Group Name) */}
        {metaLoading ? (
          <div className="h-7 w-40 mx-auto bg-zinc-200/80 animate-pulse rounded-lg my-1" />
        ) : (
          <h2
            className={cn(
              "font-bold text-center text-zinc-900 tracking-tight break-words [overflow-wrap:anywhere] line-clamp-2 px-1",
              groupMeta?.name && groupMeta.name.length > 20
                ? "text-lg sm:text-xl"
                : "text-xl sm:text-2xl"
            )}
            title={groupMeta?.name}
          >
            {groupMeta?.name ? `Unlock “${groupMeta.name}”` : "Unlock Group"}
          </h2>
        )}

        {/* Minimal Subtitle */}
        {groupMeta && (
          <p className="mt-1 text-center text-xs font-medium text-zinc-400">
            {groupMeta.participantCount} {groupMeta.participantCount === 1 ? "member" : "members"} · {groupMeta.currency}
          </p>
        )}

        {/* PIN Input & Submit Section */}
        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (pin.length === 4) {
              attemptSubmit(pin);
            }
          }}
        >
          <div className="space-y-2">
            <div
              onClick={handleContainerClick}
              className="relative flex items-center justify-center gap-2.5 sm:gap-3 py-1 cursor-pointer"
            >
              {/* Invisible native input for keyboard & accessibility */}
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                autoFocus
                autoComplete="one-time-code"
                value={pin}
                disabled={loading || isUnlocked}
                onChange={handlePinChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="sr-only"
                aria-label="4-digit PIN"
              />

              {digits.map((index) => {
                const char = pin[index];
                const isCurrent = isFocused && pin.length === index && !loading;
                const isFilled = Boolean(char);

                return (
                  <div
                    key={index}
                    className={cn(
                      "relative flex h-14 w-12 sm:h-16 sm:w-14 items-center justify-center rounded-2xl border-2 text-2xl sm:text-3xl font-bold font-mono transition-all duration-150 select-none",
                      errorMessage
                        ? "border-red-400 bg-red-50/40 text-red-600 ring-4 ring-red-400/15"
                        : isCurrent
                        ? "border-emerald-600 bg-emerald-50/20 ring-4 ring-emerald-500/15 scale-105"
                        : isFilled
                        ? "border-zinc-300 bg-white text-zinc-900 shadow-sm"
                        : "border-zinc-200 bg-zinc-50/60 text-zinc-300 hover:border-zinc-300"
                    )}
                  >
                    {isFilled ? (
                      <span className="text-zinc-900 font-bold animate-in zoom-in-75 duration-100">
                        {char}
                      </span>
                    ) : isCurrent ? (
                      <span className="h-6 w-0.5 animate-pulse bg-emerald-600 rounded-full" />
                    ) : null}
                  </div>
                );
              })}
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-rose-600 animate-in fade-in slide-in-from-top-1 duration-150">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className={cn(
              "w-full h-11 text-sm font-semibold rounded-xl text-white shadow-md transition-all active:scale-[0.99]",
              isUnlocked
                ? "bg-emerald-600 hover:bg-emerald-600"
                : "bg-emerald-600 hover:bg-emerald-700"
            )}
            disabled={loading || pin.length !== 4 || isUnlocked}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying PIN...
              </span>
            ) : isUnlocked ? (
              <span className="inline-flex items-center gap-2">
                <Check className="h-4 w-4 stroke-[3]" />
                Unlocked!
              </span>
            ) : (
              "Unlock Group"
            )}
          </Button>

          {/* Minimal Footer Navigation */}
          <div className="pt-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-zinc-400">
            <button
              type="button"
              onClick={() => setForgotOpen(true)}
              className="text-zinc-400 hover:text-zinc-700 transition-colors hover:underline inline-flex items-center gap-1"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              Forgot PIN?
            </button>

            {groupMeta?.viewId && (
              <>
                <span className="text-zinc-300">•</span>
                <Link
                  to={`/view/${groupMeta.viewId}`}
                  className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium inline-flex items-center gap-1 transition-colors"
                >
                  <span>Read-only view</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </>
            )}
          </div>
        </form>
      </div>

      {/* Forgot PIN Dialog */}
      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/60 mb-2">
              <HelpCircle className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center font-bold text-zinc-900">
              How to Find Your PIN
            </DialogTitle>
            <DialogDescription className="text-center text-zinc-500">
              Splix is privacy-first and doesn&apos;t store user emails or passwords.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-sm text-zinc-600">
            <div className="flex items-start gap-3 rounded-2xl border border-zinc-100 bg-zinc-50/70 p-3.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                1
              </span>
              <p className="text-xs leading-relaxed text-zinc-600">
                <strong className="text-zinc-900 font-semibold">Ask the creator:</strong> Check
                with the person who created this group or originally shared the link.
              </p>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-zinc-100 bg-zinc-50/70 p-3.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                2
              </span>
              <p className="text-xs leading-relaxed text-zinc-600">
                <strong className="text-zinc-900 font-semibold">Check chat history:</strong> Search
                WhatsApp or Telegram messages for the 4-digit code sent with the group link.
              </p>
            </div>

            {groupMeta?.viewId && (
              <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-200 text-xs font-bold text-emerald-900">
                  3
                </span>
                <div className="text-xs leading-relaxed text-zinc-700">
                  <strong className="text-emerald-950 font-semibold">Read-only view:</strong> Anyone
                  can see expenses and who owes what without needing the PIN.
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {groupMeta?.viewId && (
              <Button
                asChild
                variant="outline"
                className="w-full sm:w-auto text-xs font-medium rounded-xl border-emerald-200 text-emerald-800 hover:bg-emerald-50"
                onClick={() => setForgotOpen(false)}
              >
                <Link to={`/view/${groupMeta.viewId}`}>Go to Read-Only View</Link>
              </Button>
            )}
            <Button
              type="button"
              className="w-full sm:w-auto text-xs font-semibold rounded-xl bg-zinc-900 text-white hover:bg-zinc-800"
              onClick={() => setForgotOpen(false)}
            >
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
