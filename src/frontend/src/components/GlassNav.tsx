import { Link, useNavigate } from "@tanstack/react-router";
import { Home, Waves } from "lucide-react";

export function GlassNav({ showBack = false }: { showBack?: boolean }) {
  const navigate = useNavigate();

  return (
    <nav className="glass-nav fixed top-0 left-0 right-0 z-50">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link
          to="/"
          data-ocid="nav.home_link"
          className="flex items-center gap-2.5 group"
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.68 0.16 188), oklch(0.55 0.14 195))",
              boxShadow: "0 0 16px rgba(57,214,208,0.35)",
            }}
          >
            <Waves className="w-5 h-5 text-white" />
          </div>
          <span
            className="font-display text-lg font-bold tracking-wide"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.88 0.08 195), oklch(0.72 0.14 190))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Strange Chat
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              type="button"
              data-ocid="nav.back_button"
              onClick={() => navigate({ to: "/" })}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all"
              style={{
                background: "rgba(57,214,208,0.08)",
                border: "1px solid rgba(57,214,208,0.2)",
                color: "oklch(0.78 0.12 190)",
              }}
            >
              <Home className="w-4 h-4" />
              Home
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
