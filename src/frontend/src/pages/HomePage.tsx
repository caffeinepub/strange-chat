import { useNavigate } from "@tanstack/react-router";
import { Instagram, Lock, Shield, User, Users } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { GlassNav } from "../components/GlassNav";
import { ParticleField } from "../components/ParticleField";

function ProfileButton() {
  const navigate = useNavigate();
  const avatarSrc = localStorage.getItem("sc_avatar") || "";

  return (
    <button
      type="button"
      data-ocid="home.profile_button"
      onClick={() => navigate({ to: "/profile" })}
      title="My Profile"
      style={{
        position: "fixed",
        top: "12px",
        right: "16px",
        zIndex: 60,
        width: 44,
        height: 44,
        borderRadius: "50%",
        overflow: "hidden",
        border: "2px solid rgba(57,214,208,0.45)",
        boxShadow: "0 0 18px rgba(57,214,208,0.30), 0 2px 8px rgba(0,0,0,0.4)",
        background: avatarSrc ? "transparent" : "rgba(8,18,28,0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        cursor: "pointer",
        padding: 0,
        transition: "box-shadow 0.25s, transform 0.2s",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.boxShadow =
          "0 0 28px rgba(57,214,208,0.55), 0 4px 12px rgba(0,0,0,0.5)";
        (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.06)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.boxShadow =
          "0 0 18px rgba(57,214,208,0.30), 0 2px 8px rgba(0,0,0,0.4)";
        (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
      }}
    >
      {avatarSrc ? (
        <img
          src={avatarSrc}
          alt="Profile"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <User className="w-5 h-5" style={{ color: "oklch(0.72 0.14 190)" }} />
      )}
    </button>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const [, setTick] = useState(0);
  void setTick;

  return (
    <div className="waterfall-bg min-h-screen relative">
      {/* Aurora sweep */}
      <div className="aurora-layer" />

      {/* Decorative orbs */}
      <div
        className="orb orb-float-slow"
        style={{
          width: 500,
          height: 500,
          top: "-150px",
          left: "-120px",
          background: "oklch(0.55 0.16 185 / 0.12)",
          filter: "blur(90px)",
        }}
      />
      <div
        className="orb orb-float"
        style={{
          width: 400,
          height: 400,
          top: "20%",
          right: "-100px",
          background: "oklch(0.50 0.14 200 / 0.10)",
          filter: "blur(80px)",
          animationDelay: "3s",
        }}
      />
      <div
        className="orb orb-float-slow"
        style={{
          width: 300,
          height: 300,
          bottom: "10%",
          left: "30%",
          background: "oklch(0.48 0.18 175 / 0.08)",
          filter: "blur(70px)",
          animationDelay: "5s",
        }}
      />

      <ParticleField />
      <GlassNav />

      {/* Profile button (fixed top-right) */}
      <ProfileButton />

      {/* Main content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Hero */}
        <section className="flex-1 flex flex-col items-center justify-center px-6 pt-24 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Hero Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="font-display leading-none mb-6"
              style={{
                fontSize: "clamp(3.2rem, 10vw, 7rem)",
                letterSpacing: "0.07em",
              }}
            >
              <span className="hero-text-gradient">STRANGE</span>
              <br />
              <span className="hero-text-gradient">CHAT</span>
            </motion.h1>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.7 }}
              className="text-lg md:text-xl mb-14 max-w-xl mx-auto leading-relaxed"
              style={{ color: "oklch(0.65 0.03 210)", letterSpacing: "0.02em" }}
            >
              Connect with friends privately or discover strangers worldwide.
              <br />
              <span style={{ color: "oklch(0.72 0.10 190)" }}>
                Voice &amp; video calls
              </span>{" "}
              included.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-5 justify-center items-center"
            >
              <button
                type="button"
                data-ocid="home.friends_button"
                onClick={() => navigate({ to: "/friends" })}
                className="btn-teal flex items-center gap-3 px-12 py-4 text-lg min-w-[210px] justify-center"
              >
                <Users className="w-5 h-5" />
                FRIENDS
              </button>
              <button
                type="button"
                data-ocid="home.stranger_button"
                onClick={() => navigate({ to: "/stranger" })}
                className="btn-navy-outline flex items-center gap-3 px-12 py-4 text-lg min-w-[210px] justify-center"
              >
                <User className="w-5 h-5" />
                STRANGER
              </button>
            </motion.div>
          </motion.div>
        </section>

        {/* Feature Cards */}
        <motion.section
          initial={{ opacity: 0, y: 45 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.7 }}
          className="px-6 pb-10"
        >
          <div className="max-w-4xl mx-auto">
            <h2
              className="text-xl md:text-2xl font-bold mb-7 text-center"
              style={{
                color: "oklch(0.76 0.08 200)",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Experience Premium Connection
            </h2>
            <div className="grid md:grid-cols-2 gap-5">
              {/* Card 1 */}
              <div
                className="glass-card p-7 flex items-start gap-5"
                data-ocid="home.encrypted_chats.card"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: "rgba(57,214,208,0.12)",
                    border: "1px solid rgba(57,214,208,0.28)",
                    boxShadow: "0 0 16px rgba(57,214,208,0.12)",
                  }}
                >
                  <Lock
                    className="w-6 h-6"
                    style={{ color: "oklch(0.72 0.14 190)" }}
                  />
                </div>
                <div>
                  <h3
                    className="font-semibold text-lg mb-2"
                    style={{
                      color: "oklch(0.88 0.06 200)",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                  >
                    Encrypted Chats
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "oklch(0.60 0.025 210)" }}
                  >
                    All conversations secured with secret room codes. Your
                    privacy is our top priority.
                  </p>
                </div>
              </div>

              {/* Card 2 */}
              <div
                className="glass-card p-7 flex items-start gap-5"
                data-ocid="home.secure_rooms.card"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: "rgba(57,214,208,0.12)",
                    border: "1px solid rgba(57,214,208,0.28)",
                    boxShadow: "0 0 16px rgba(57,214,208,0.12)",
                  }}
                >
                  <Shield
                    className="w-6 h-6"
                    style={{ color: "oklch(0.72 0.14 190)" }}
                  />
                </div>
                <div>
                  <h3
                    className="font-semibold text-lg mb-2"
                    style={{
                      color: "oklch(0.88 0.06 200)",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                  >
                    Secure Rooms
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "oklch(0.60 0.025 210)" }}
                  >
                    Create private rooms with unique codes. Only those with the
                    code can join your conversation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Footer */}
        <footer
          className="py-5 px-6 text-center"
          style={{
            background: "rgba(3, 8, 14, 0.88)",
            borderTop: "1px solid rgba(57,214,208,0.10)",
          }}
        >
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
            <span style={{ color: "oklch(0.48 0.02 215)" }}>
              &copy; {new Date().getFullYear()} Strange Chat. All rights
              reserved.
            </span>
            <span style={{ color: "oklch(0.53 0.03 212)" }}>
              Designed by{" "}
              <span
                className="font-semibold"
                style={{ color: "oklch(0.72 0.12 190)" }}
              >
                Ramana Reddy
              </span>
            </span>
            <a
              href="https://www.instagram.com/strangechat_fun"
              target="_blank"
              rel="noopener noreferrer"
              data-ocid="footer.instagram_link"
              className="flex items-center gap-2 transition-all"
              style={{ color: "oklch(0.72 0.14 190)" }}
            >
              <Instagram className="w-4 h-4" />
              <span className="hover:underline">@strangechat_fun</span>
            </a>
          </div>
          <div
            className="mt-3 text-xs"
            style={{ color: "oklch(0.40 0.02 215)" }}
          >
            Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
              style={{ color: "oklch(0.55 0.06 190)" }}
            >
              caffeine.ai
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
