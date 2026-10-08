import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Download, Plus, WifiOff } from "lucide-react";
import { SplixLogo } from "./Logo";
import { usePwaInstall } from "@/pwa";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function AppHeader({ groupName, rightContent }) {
  const location = useLocation();
  const isLanding = location.pathname === "/" && !groupName;
  const { canInstall, promptInstall } = usePwaInstall();
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }
    function handleOffline() {
      setIsOnline(false);
    }
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Link to="/" aria-label="Go to home" className="inline-flex items-center transition hover:opacity-90">
            <SplixLogo className="h-8 w-auto" />
          </Link>
          {groupName && (
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-zinc-200">
              <span className="text-sm font-semibold text-zinc-900 truncate max-w-xs">{groupName}</span>
            </div>
          )}
          {isLanding && (
            <nav className="hidden md:flex items-center gap-5 pl-4 border-l border-zinc-200/80">
              <a href="#why-splix" className="text-xs font-semibold text-zinc-600 hover:text-emerald-700 transition">
                Features
              </a>
              <a href="#how-it-works" className="text-xs font-semibold text-zinc-600 hover:text-emerald-700 transition">
                How It Works
              </a>
            </nav>
          )}
          {!isOnline && (
            <Badge
              variant="secondary"
              className="hidden sm:inline-flex items-center gap-1 text-[11px] font-normal text-zinc-600 border border-zinc-200 py-0.5 px-2"
            >
              <WifiOff className="h-3 w-3" />
              <span>Offline</span>
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isOnline && (
            <Badge
              variant="secondary"
              className="sm:hidden inline-flex items-center gap-1 text-[11px] font-normal text-zinc-600 border border-zinc-200 py-0.5 px-2"
            >
              <WifiOff className="h-3 w-3" />
              <span>Offline</span>
            </Badge>
          )}

          {canInstall && (
            <Button
              variant="outline"
              size="sm"
              onClick={promptInstall}
              className="h-8 px-2.5 text-xs font-medium border-zinc-200 hover:bg-zinc-100 text-zinc-700 rounded-lg gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Install App</span>
            </Button>
          )}

          {isLanding && !rightContent && (
            <Button
              size="sm"
              asChild
              className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs gap-1.5 shadow-sm hidden sm:inline-flex"
            >
              <a href="#create-group">
                <Plus className="h-3.5 w-3.5" />
                <span>Create Group</span>
              </a>
            </Button>
          )}

          {rightContent}
        </div>
      </div>
    </header>
  );
}
