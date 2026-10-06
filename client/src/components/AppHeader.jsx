import { Link } from "react-router-dom";
import { SplixLogo } from "./Logo";

export function AppHeader({ groupName, rightContent }) {
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
        </div>
        {rightContent && <div className="flex items-center gap-2">{rightContent}</div>}
      </div>
    </header>
  );
}
