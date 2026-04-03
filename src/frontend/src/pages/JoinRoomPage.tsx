import { useNavigate, useSearch } from "@tanstack/react-router";
import { ArrowLeft, LogIn } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getBackend } from "../backend-instance";
import { GlassNav } from "../components/GlassNav";

export function JoinRoomPage() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { code?: string };
  const [name, setName] = useState(
    () => localStorage.getItem("strangechat_username") || "",
  );
  const [code, setCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    if (search.code) setCode(search.code);
  }, [search.code]);

  const handleJoin = async () => {
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!code || code.length !== 6 || !/^\d+$/.test(code)) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }
    setIsJoining(true);
    try {
      localStorage.setItem("strangechat_username", name.trim());
      await (await getBackend()).joinRoom(name.trim(), BigInt(code));
      navigate({ to: "/chat/$roomCode", params: { roomCode: code } });
    } catch (e) {
      console.error(e);
      toast.error("Failed to join room.");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="inner-bg min-h-screen relative overflow-hidden">
      {/* Orbs */}
      <div
        className="orb orb-float"
        style={{
          width: 360,
          height: 360,
          top: -80,
          left: -70,
          background: "oklch(0.50 0.14 192 / 0.09)",
          filter: "blur(90px)",
          position: "absolute",
          zIndex: 0,
        }}
      />
      <div
        className="orb orb-float-slow"
        style={{
          width: 280,
          height: 280,
          bottom: 40,
          right: -50,
          background: "oklch(0.48 0.16 205 / 0.07)",
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
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <button
            type="button"
            data-ocid="join.back_button"
            onClick={() => navigate({ to: "/friends" })}
            className="flex items-center gap-2 mb-8 text-sm"
            style={{ color: "oklch(0.62 0.06 200)" }}
          >
            <ArrowLeft className="w-4 h-4" /> Back to Friends
          </button>

          <div
            className="glass-card p-8"
            style={{ borderColor: "rgba(57,214,208,0.18)" }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: "rgba(57,214,208,0.12)",
                  border: "1px solid rgba(57,214,208,0.28)",
                  boxShadow: "0 0 16px rgba(57,214,208,0.12)",
                }}
              >
                <LogIn
                  className="w-5 h-5"
                  style={{ color: "oklch(0.72 0.14 190)" }}
                />
              </div>
              <div>
                <h1
                  className="font-display text-2xl font-bold"
                  style={{ color: "oklch(0.88 0.08 195)" }}
                >
                  Join Room
                </h1>
                <p
                  className="text-xs"
                  style={{ color: "oklch(0.55 0.025 210)" }}
                >
                  Enter the secret code from your friend
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="join-name"
                  className="block text-sm font-medium mb-2"
                  style={{ color: "oklch(0.72 0.06 200)" }}
                >
                  Your Name
                </label>
                <input
                  id="join-name"
                  type="text"
                  data-ocid="join.name_input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name..."
                  className="sc-input w-full px-4 py-3 text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="join-code"
                  className="block text-sm font-medium mb-2"
                  style={{ color: "oklch(0.72 0.06 200)" }}
                >
                  Room Code
                </label>
                <input
                  id="join-code"
                  type="text"
                  data-ocid="join.code_input"
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="000000"
                  maxLength={6}
                  className="sc-input w-full px-4 py-3 text-sm font-mono tracking-widest text-center text-xl"
                  onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                />
              </div>
              <button
                type="button"
                data-ocid="join.submit_button"
                onClick={handleJoin}
                disabled={isJoining}
                className="btn-teal w-full py-4 text-base flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <LogIn className="w-5 h-5" />
                {isJoining ? "Joining..." : "Join Room"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
