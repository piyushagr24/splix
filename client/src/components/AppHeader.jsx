import { Link } from "react-router-dom";
import { SplixLogo } from "./Logo";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 md:px-8">
        <Link to="/" aria-label="Go to home" className="inline-flex items-center">
          <SplixLogo className="h-8 w-auto" />
        </Link>
      </div>
    </header>
  );
}

