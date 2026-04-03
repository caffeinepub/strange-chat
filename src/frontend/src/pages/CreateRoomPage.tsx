import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, Copy, Key, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { getBackend } from "../backend-instance";
import { GlassNav } from "../components/GlassNav";

export function CreateRoomPage() {
  const navigate = useNavigate();
  const [name, setName] = useState(
    () => localStorage.getItem("strangechat_username") || "",
  );
  const [code, setCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [created, setCreated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareLink, setShareLink] = useState("");

  const generateCode = () => {
    setCode(Math.floor(100000 + Math.random() * 900000).toString());
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!code || code.length !== 6 || !/^\d+$/.test(code)) {
      toast.error("Please enter or generate a 6-digit code");
      return;
    }
    setIsCreating(true);
    try {
      localStorage.setItem("strangechat_username", name.trim());
      (await getBackend()).createRoom(name.trim(), BigInt(code));
      setShareLink(`${window.location.origin}/join?code=${code}`);
      setCreated(true);
      toast.success("Room created successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to create room.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="inner-bg min-h-screen relative overflow-hidden">
      {/* Orbs */}
      <div
        className="orb orb-float"
        style={{
          width: 380,
          height: 380,
          top: -80,
          right: -60,
          background: "oklch(0.50 0.14 188 / 0.09)",
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
          left: -50,
          background: "oklch(0.48 0.15 200 / 0.07)",
          filter: "blur(75px)",
          position: "absolute",
          zIndex: 0,
          animationDelay: "3s",
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
            data-ocid="create.back_button"
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
                <Key
                  className="w-5 h-5"
                  style={{ color: "oklch(0.72 0.14 190)" }}
                />
              </div>
              <div>
                <h1
                  className="font-display text-2xl font-bold"
                  style={{ color: "oklch(0.88 0.08 195)" }}
                >
                  Create Room
                </h1>
                <p
                  className="text-xs"
                  style={{ color: "oklch(0.55 0.025 210)" }}
                >
                  Generate a secret code for your friends
                </p>
              </div>
            </div>

            {!created ? (
              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="create-name"
                    className="block text-sm font-medium mb-2"
                    style={{ color: "oklch(0.72 0.06 200)" }}
                  >
                    Your Name
                  </label>
                  <input
                    id="create-name"
                    type="text"
                    data-ocid="create.name_input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name..."
                    className="sc-input w-full px-4 py-3 text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="create-code"
                    className="block text-sm font-medium mb-2"
                    style={{ color: "oklch(0.72 0.06 200)" }}
                  >
                    Security Code (6 digits)
                  </label>
                  <div className="flex gap-3">
                    <input
                      id="create-code"
                      type="text"
                      data-ocid="create.code_input"
                      value={code}
                      onChange={(e) =>
                        setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      placeholder="000000"
                      maxLength={6}
                      className="sc-input flex-1 px-4 py-3 text-sm font-mono tracking-widest text-center"
                    />
                    <button
                      type="button"
                      data-ocid="create.generate_button"
                      onClick={generateCode}
                      className="px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-medium transition-all"
                      style={{
                        background: "rgba(57,214,208,0.10)",
                        border: "1px solid rgba(57,214,208,0.28)",
                        color: "oklch(0.72 0.14 190)",
                      }}
                    >
                      <RefreshCw className="w-4 h-4" /> Generate
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  data-ocid="create.submit_button"
                  onClick={handleCreate}
                  disabled={isCreating}
                  className="btn-teal w-full py-4 text-base mt-2 disabled:opacity-50"
                >
                  {isCreating ? "Creating..." : "Create Room"}
                </button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
                data-ocid="create.success_state"
              >
                <div className="text-center">
                  <div className="text-5xl font-mono font-bold mb-2 tracking-[0.25em] hero-text-gradient">
                    {code}
                  </div>
                  <p
                    className="text-sm mb-5"
                    style={{ color: "oklch(0.58 0.025 210)" }}
                  >
                    Share this code with your friend
                  </p>
                </div>
                <div
                  className="p-4 rounded-xl"
                  style={{
                    background: "rgba(8,18,28,0.75)",
                    border: "1px solid rgba(57,214,208,0.16)",
                  }}
                >
                  <p
                    className="text-xs mb-2"
                    style={{ color: "oklch(0.55 0.025 210)" }}
                  >
                    Or share this direct link:
                  </p>
                  <div className="flex gap-2 items-center">
                    <span
                      className="flex-1 text-xs font-mono truncate"
                      style={{ color: "oklch(0.70 0.08 195)" }}
                    >
                      {shareLink}
                    </span>
                    <button
                      type="button"
                      data-ocid="create.copy_link_button"
                      onClick={() => handleCopy(shareLink)}
                      className="p-2 rounded-lg transition-all"
                      style={{
                        background: "rgba(57,214,208,0.10)",
                        border: "1px solid rgba(57,214,208,0.25)",
                        color: "oklch(0.72 0.14 190)",
                      }}
                    >
                      {copied ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  data-ocid="create.enter_room_button"
                  onClick={() =>
                    navigate({
                      to: "/chat/$roomCode",
                      params: { roomCode: code },
                    })
                  }
                  className="btn-teal w-full py-4 text-base"
                >
                  Enter Room
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
