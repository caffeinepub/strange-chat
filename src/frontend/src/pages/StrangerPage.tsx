import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Globe2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { getBackend } from "../backend-instance";
import { GlassNav } from "../components/GlassNav";

const COUNTRIES = [
  { flag: "🌍", name: "Global" },
  { flag: "🇺🇸", name: "USA" },
  { flag: "🇬🇧", name: "UK" },
  { flag: "🇮🇳", name: "India" },
  { flag: "🇧🇷", name: "Brazil" },
  { flag: "🇩🇪", name: "Germany" },
  { flag: "🇫🇷", name: "France" },
  { flag: "🇯🇵", name: "Japan" },
  { flag: "🇰🇷", name: "South Korea" },
  { flag: "🇦🇺", name: "Australia" },
  { flag: "🇨🇦", name: "Canada" },
  { flag: "🇲🇽", name: "Mexico" },
  { flag: "🇮🇹", name: "Italy" },
  { flag: "🇪🇸", name: "Spain" },
  { flag: "🇷🇺", name: "Russia" },
  { flag: "🇸🇦", name: "Saudi Arabia" },
  { flag: "🇹🇷", name: "Turkey" },
  { flag: "🇳🇬", name: "Nigeria" },
  { flag: "🇵🇭", name: "Philippines" },
  { flag: "🇮🇩", name: "Indonesia" },
  { flag: "🇦🇷", name: "Argentina" },
];

export function StrangerPage() {
  const navigate = useNavigate();
  const [name, setName] = useState(
    () =>
      localStorage.getItem("strangechat_username") ||
      localStorage.getItem("sc_username") ||
      "",
  );
  const myAvatar = localStorage.getItem("sc_avatar") || "";
  const myDisplayName = localStorage.getItem("sc_username") || name;
  const [country, setCountry] = useState(() => {
    const saved = localStorage.getItem("strangechat_country");
    return saved ? (JSON.parse(saved) as (typeof COUNTRIES)[0]) : COUNTRIES[0];
  });
  const [isSearching, setIsSearching] = useState(false);
  const [dots, setDots] = useState(0);
  const [showCountryDrop, setShowCountryDrop] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isSearching) return;
    const t = setInterval(() => setDots((d) => (d + 1) % 4), 500);
    return () => clearInterval(t);
  }, [isSearching]);

  useEffect(() => {
    if (!isSearching) return;
    const poll = async () => {
      try {
        const result = (await getBackend()).checkMatchmakingStatus();
        if (result !== null) {
          clearInterval(pollRef.current!);
          navigate({
            to: "/chat/$roomCode",
            params: { roomCode: result.toString() },
          });
        }
      } catch (e) {
        console.error(e);
      }
    };
    pollRef.current = setInterval(poll, 2000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [isSearching, navigate]);

  const handleFind = async () => {
    if (!name.trim()) {
      toast.error("Please enter your name first");
      return;
    }
    localStorage.setItem("strangechat_username", name.trim());
    localStorage.setItem("strangechat_country", JSON.stringify(country));
    setIsSearching(true);
    try {
      (await getBackend()).requestMatchmaking(BigInt(Date.now()));
    } catch (e) {
      console.error(e);
      toast.error("Failed to start matchmaking.");
      setIsSearching(false);
    }
  };

  const handleCancel = () => {
    setIsSearching(false);
    if (pollRef.current) clearInterval(pollRef.current);
  };

  return (
    <div className="inner-bg min-h-screen relative overflow-hidden">
      {/* Orbs */}
      <div
        className="orb orb-float"
        style={{
          width: 400,
          height: 400,
          top: -100,
          right: -80,
          background: "oklch(0.52 0.14 190 / 0.09)",
          filter: "blur(90px)",
          position: "absolute",
          zIndex: 0,
        }}
      />
      <div
        className="orb orb-float-slow"
        style={{
          width: 300,
          height: 300,
          bottom: 60,
          left: -60,
          background: "oklch(0.50 0.16 200 / 0.07)",
          filter: "blur(80px)",
          position: "absolute",
          zIndex: 0,
          animationDelay: "4s",
        }}
      />

      <GlassNav />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          className="w-full max-w-md"
        >
          <button
            type="button"
            data-ocid="stranger.back_button"
            onClick={() => navigate({ to: "/" })}
            className="flex items-center gap-2 mb-8 text-sm transition-colors"
            style={{ color: "oklch(0.62 0.06 200)" }}
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>

          <div
            className="glass-card p-8"
            style={{ borderColor: "rgba(57,214,208,0.18)" }}
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: "rgba(57,214,208,0.12)",
                    border: "1px solid rgba(57,214,208,0.28)",
                    boxShadow: "0 0 20px rgba(57,214,208,0.12)",
                  }}
                >
                  <Globe2
                    className="w-5 h-5"
                    style={{ color: "oklch(0.72 0.14 190)" }}
                  />
                </div>
                <div>
                  <h1
                    className="font-display text-2xl font-bold"
                    style={{ color: "oklch(0.88 0.08 195)" }}
                  >
                    Stranger Chat
                  </h1>
                  <p
                    className="text-xs"
                    style={{ color: "oklch(0.55 0.025 210)" }}
                  >
                    Connect with someone random worldwide
                  </p>
                </div>
              </div>
              {/* User badge */}
              {(myDisplayName || myAvatar) && (
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                  style={{
                    background: "rgba(57,214,208,0.07)",
                    border: "1px solid rgba(57,214,208,0.18)",
                  }}
                >
                  {myAvatar ? (
                    <img
                      src={myAvatar}
                      alt={myDisplayName}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "1.5px solid rgba(57,214,208,0.35)",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: "rgba(57,214,208,0.15)",
                        border: "1.5px solid rgba(57,214,208,0.30)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <svg
                        viewBox="0 0 16 16"
                        fill="none"
                        width="12"
                        height="12"
                        aria-hidden="true"
                      >
                        <circle
                          cx="8"
                          cy="6"
                          r="3"
                          fill="oklch(0.72 0.14 190)"
                        />
                        <path
                          d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6"
                          stroke="oklch(0.72 0.14 190)"
                          strokeWidth="1.5"
                          fill="none"
                        />
                      </svg>
                    </div>
                  )}
                  <span
                    className="text-xs font-semibold"
                    style={{ color: "oklch(0.78 0.10 190)" }}
                  >
                    {myDisplayName}
                  </span>
                </div>
              )}
            </div>

            <AnimatePresence mode="wait">
              {!isSearching ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-5"
                >
                  {/* Name */}
                  <div>
                    <label
                      htmlFor="stranger-name"
                      className="block text-sm font-medium mb-2"
                      style={{ color: "oklch(0.72 0.06 200)" }}
                    >
                      Your Name
                    </label>
                    <input
                      id="stranger-name"
                      type="text"
                      data-ocid="stranger.name_input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name..."
                      className="sc-input w-full px-4 py-3 text-sm"
                      onKeyDown={(e) => e.key === "Enter" && handleFind()}
                    />
                  </div>

                  {/* Country picker */}
                  <div className="relative">
                    <span
                      className="block text-sm font-medium mb-2"
                      style={{ color: "oklch(0.72 0.06 200)" }}
                    >
                      Your Country
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCountryDrop((v) => !v)}
                      className="sc-input w-full px-4 py-3 text-sm flex items-center justify-between"
                      style={{ borderRadius: 12, cursor: "pointer" }}
                    >
                      <span>
                        {country.flag} {country.name}
                      </span>
                      <span style={{ color: "oklch(0.52 0.025 210)" }}>
                        &#9660;
                      </span>
                    </button>
                    {showCountryDrop && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute left-0 right-0 top-full mt-1 z-30 rounded-xl overflow-hidden"
                        style={{
                          background: "rgba(6,14,22,0.98)",
                          border: "1px solid rgba(57,214,208,0.22)",
                          maxHeight: 220,
                          overflowY: "auto",
                        }}
                      >
                        {COUNTRIES.map((c) => (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => {
                              setCountry(c);
                              setShowCountryDrop(false);
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2.5 transition-colors hover:bg-white/5"
                            style={{
                              color:
                                country.name === c.name
                                  ? "oklch(0.80 0.14 190)"
                                  : "oklch(0.78 0.03 210)",
                            }}
                          >
                            {c.flag} {c.name}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </div>

                  <button
                    type="button"
                    data-ocid="stranger.find_button"
                    onClick={handleFind}
                    className="btn-teal w-full py-4 text-base flex items-center justify-center gap-3"
                  >
                    <Globe2 className="w-5 h-5" /> Find a Stranger
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="searching"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-6 py-6"
                  data-ocid="stranger.loading_state"
                >
                  {/* Radar pulse animation */}
                  <div
                    className="relative flex items-center justify-center"
                    style={{ width: 120, height: 120 }}
                  >
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="radar-ring absolute"
                        style={{
                          width: 40,
                          height: 40,
                          animationDelay: `${i * 0.8}s`,
                          animationDuration: "2.4s",
                        }}
                      />
                    ))}
                    <div
                      className="relative z-10 w-14 h-14 rounded-full flex items-center justify-center"
                      style={{
                        background: "rgba(57,214,208,0.12)",
                        border: "2px solid rgba(57,214,208,0.45)",
                        boxShadow: "0 0 24px rgba(57,214,208,0.25)",
                      }}
                    >
                      <Globe2
                        className="w-7 h-7"
                        style={{ color: "oklch(0.75 0.16 188)" }}
                      />
                    </div>
                  </div>

                  <div className="text-center">
                    <div
                      className="text-lg font-semibold mb-1"
                      style={{ color: "oklch(0.82 0.08 195)" }}
                    >
                      Searching from {country.flag} {country.name}
                      {".".repeat(dots)}
                    </div>
                    <p
                      className="text-sm"
                      style={{ color: "oklch(0.55 0.025 210)" }}
                    >
                      Looking for a stranger worldwide...
                    </p>
                  </div>

                  {/* Pulsing dots */}
                  <div className="flex gap-2">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="waiting-dot w-2.5 h-2.5 rounded-full"
                        style={{ background: "oklch(0.72 0.14 190)" }}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    data-ocid="stranger.cancel_button"
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all"
                    style={{
                      background: "rgba(220,60,40,0.10)",
                      border: "1px solid rgba(220,60,40,0.28)",
                      color: "oklch(0.65 0.22 25)",
                    }}
                  >
                    <X className="w-4 h-4" /> Cancel Search
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
