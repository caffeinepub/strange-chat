import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, LogIn, PlusCircle } from "lucide-react";
import { motion } from "motion/react";
import { GlassNav } from "../components/GlassNav";

export function FriendsPage() {
  const navigate = useNavigate();

  return (
    <div className="inner-bg min-h-screen relative overflow-hidden">
      {/* Decorative orbs */}
      <div
        className="orb orb-float"
        style={{
          width: 450,
          height: 450,
          top: -120,
          right: -100,
          background: "oklch(0.52 0.14 190 / 0.09)",
          filter: "blur(100px)",
          position: "absolute",
          zIndex: 0,
        }}
      />
      <div
        className="orb orb-float-slow"
        style={{
          width: 350,
          height: 350,
          bottom: 0,
          left: -80,
          background: "oklch(0.48 0.16 205 / 0.07)",
          filter: "blur(90px)",
          position: "absolute",
          zIndex: 0,
          animationDelay: "5s",
        }}
      />

      <GlassNav />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-xl text-center"
        >
          <button
            type="button"
            data-ocid="friends.back_button"
            onClick={() => navigate({ to: "/" })}
            className="flex items-center gap-2 mb-8 mx-auto text-sm transition-colors"
            style={{ color: "oklch(0.62 0.06 200)" }}
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>

          <h1
            className="font-display leading-none mb-4"
            style={{
              fontSize: "clamp(3rem, 8vw, 5rem)",
              background:
                "linear-gradient(135deg, oklch(0.88 0.08 195), oklch(0.72 0.16 190), oklch(0.80 0.12 185))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 0 20px oklch(0.72 0.14 190 / 0.35))",
            }}
          >
            Friends
          </h1>
          <p
            className="text-base mb-12"
            style={{ color: "oklch(0.60 0.025 210)" }}
          >
            Create a private room or join an existing one with a secret code.
          </p>

          <div className="grid sm:grid-cols-2 gap-6">
            {/* JOIN */}
            <motion.button
              type="button"
              data-ocid="friends.join_button"
              whileHover={{ scale: 1.04, y: -4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate({ to: "/join" })}
              className="glass-card p-10 flex flex-col items-center gap-5 cursor-pointer w-full"
            >
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{
                  background: "rgba(57,214,208,0.10)",
                  border: "1.5px solid rgba(57,214,208,0.32)",
                  boxShadow: "0 0 30px rgba(57,214,208,0.14)",
                }}
              >
                <LogIn
                  className="w-10 h-10"
                  style={{ color: "oklch(0.72 0.14 190)" }}
                />
              </div>
              <div>
                <div
                  className="font-display text-3xl font-bold mb-2"
                  style={{ color: "oklch(0.88 0.08 195)" }}
                >
                  JOIN
                </div>
                <div
                  className="text-sm"
                  style={{ color: "oklch(0.58 0.025 210)" }}
                >
                  Enter a room code to join your friend
                </div>
              </div>
            </motion.button>

            {/* CREATE */}
            <motion.button
              type="button"
              data-ocid="friends.create_button"
              whileHover={{ scale: 1.04, y: -4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate({ to: "/create" })}
              className="glass-card p-10 flex flex-col items-center gap-5 cursor-pointer w-full"
              style={{ borderColor: "rgba(57,214,208,0.25)" }}
            >
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(57,214,208,0.18), rgba(57,214,208,0.08))",
                  border: "1.5px solid rgba(57,214,208,0.42)",
                  boxShadow: "0 0 40px rgba(57,214,208,0.22)",
                }}
              >
                <PlusCircle
                  className="w-10 h-10"
                  style={{ color: "oklch(0.78 0.18 185)" }}
                />
              </div>
              <div>
                <div className="font-display text-3xl font-bold mb-2 teal-gradient-text">
                  CREATE
                </div>
                <div
                  className="text-sm"
                  style={{ color: "oklch(0.58 0.025 210)" }}
                >
                  Create a new private room
                </div>
              </div>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
