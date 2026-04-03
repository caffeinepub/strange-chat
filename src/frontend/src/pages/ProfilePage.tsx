import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Camera, Lock, Save, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { GlassNav } from "../components/GlassNav";
import { ParticleField } from "../components/ParticleField";

const AVATARS = [
  {
    id: "aisha",
    src: "/assets/generated/avatar-aisha.dim_120x120.jpg",
    label: "Aisha",
  },
  {
    id: "emma",
    src: "/assets/generated/avatar-emma.dim_120x120.jpg",
    label: "Emma",
  },
  {
    id: "luis",
    src: "/assets/generated/avatar-luis.dim_120x120.jpg",
    label: "Luis",
  },
  {
    id: "marcus",
    src: "/assets/generated/avatar-marcus.dim_120x120.jpg",
    label: "Marcus",
  },
  {
    id: "raj",
    src: "/assets/generated/avatar-raj.dim_120x120.jpg",
    label: "Raj",
  },
  {
    id: "sarah",
    src: "/assets/generated/avatar-sarah.dim_120x120.jpg",
    label: "Sarah",
  },
];

const BADGES = [
  {
    emoji: "🗨️",
    label: "First Chat",
    desc: "Started your first conversation",
    key: "sc_chats",
    threshold: 1,
  },
  {
    emoji: "🌍",
    label: "Globe Trotter",
    desc: "Met someone from across the globe",
    key: "sc_strangers",
    threshold: 1,
  },
  {
    emoji: "🎮",
    label: "Game Master",
    desc: "Played 5+ games",
    key: "sc_games",
    threshold: 5,
  },
  {
    emoji: "🔥",
    label: "On Fire",
    desc: "Started 10+ chats",
    key: "sc_chats",
    threshold: 10,
  },
  {
    emoji: "👑",
    label: "Legend",
    desc: "Met 20+ strangers",
    key: "sc_strangers",
    threshold: 20,
  },
];

export function ProfilePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedAvatar, setSelectedAvatar] = useState(
    () => localStorage.getItem("sc_avatar") || "",
  );
  const [customPhoto, setCustomPhoto] = useState(
    () => localStorage.getItem("sc_custom_photo") || "",
  );
  const [username, setUsername] = useState(
    () => localStorage.getItem("sc_username") || "",
  );
  const [bio, setBio] = useState(() => localStorage.getItem("sc_bio") || "");
  const [saved, setSaved] = useState(false);

  const chats = Number(localStorage.getItem("sc_chats") ?? 0);
  const strangers = Number(localStorage.getItem("sc_strangers") ?? 0);
  const games = Number(localStorage.getItem("sc_games") ?? 0);

  const stats = [
    { label: "Chats Started", value: chats },
    { label: "Strangers Met", value: strangers },
    { label: "Games Played", value: games },
  ];

  // The active photo shown big at the top
  const activePhoto = customPhoto || selectedAvatar;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setCustomPhoto(dataUrl);
      setSelectedAvatar(""); // deselect preset when custom photo is used
      toast.success("Photo uploaded! Save to apply.");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCustomPhoto = () => {
    setCustomPhoto("");
    toast("Custom photo removed.");
  };

  const handleSave = () => {
    localStorage.setItem("sc_username", username.trim());
    localStorage.setItem("sc_bio", bio.trim());
    if (customPhoto) {
      localStorage.setItem("sc_custom_photo", customPhoto);
      localStorage.setItem("sc_avatar", customPhoto);
    } else {
      localStorage.removeItem("sc_custom_photo");
      localStorage.setItem("sc_avatar", selectedAvatar);
    }
    setSaved(true);
    toast.success("Profile saved!");
    setTimeout(() => setSaved(false), 2500);
  };

  // Sync strangechat_username with sc_username for backward compat
  useEffect(() => {
    if (!localStorage.getItem("sc_username")) {
      const legacy = localStorage.getItem("strangechat_username");
      if (legacy) setUsername(legacy);
    }
  }, []);

  const statMap: Record<string, number> = {
    sc_chats: chats,
    sc_strangers: strangers,
    sc_games: games,
  };

  return (
    <div className="waterfall-bg min-h-screen relative">
      {/* Aurora */}
      <div className="aurora-layer" />

      {/* Orbs */}
      <div
        className="orb orb-float-slow"
        style={{
          width: 480,
          height: 480,
          top: "-100px",
          left: "-120px",
          background: "oklch(0.55 0.16 185 / 0.11)",
          filter: "blur(90px)",
        }}
      />
      <div
        className="orb orb-float"
        style={{
          width: 380,
          height: 380,
          top: "30%",
          right: "-80px",
          background: "oklch(0.50 0.14 200 / 0.09)",
          filter: "blur(80px)",
          animationDelay: "3s",
        }}
      />
      <div
        className="orb orb-float-slow"
        style={{
          width: 280,
          height: 280,
          bottom: "8%",
          left: "35%",
          background: "oklch(0.48 0.18 175 / 0.07)",
          filter: "blur(70px)",
          animationDelay: "6s",
        }}
      />

      <ParticleField />
      <GlassNav />

      <div className="relative z-10 min-h-screen pt-20 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Back button */}
          <motion.button
            type="button"
            data-ocid="profile.back_button"
            onClick={() => navigate({ to: "/" })}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
            className="flex items-center gap-2 mb-8 text-sm transition-colors"
            style={{ color: "oklch(0.62 0.06 200)" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </motion.button>

          {/* Page title */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-10 text-center"
          >
            <h1
              className="font-display text-4xl md:text-5xl font-bold mb-2"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.88 0.08 195), oklch(0.72 0.14 190), oklch(0.65 0.18 180))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 0 22px oklch(0.72 0.14 190 / 0.45))",
              }}
            >
              My Profile
            </h1>
            <p className="text-sm" style={{ color: "oklch(0.58 0.025 210)" }}>
              Customize how you appear in chats
            </p>
          </motion.div>

          {/* Profile Photo Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15 }}
            className="flex flex-col items-center mb-6"
          >
            <div className="relative" style={{ width: 110, height: 110 }}>
              <div
                className="w-full h-full rounded-full overflow-hidden"
                style={{
                  border: "3px solid oklch(0.72 0.14 190)",
                  boxShadow:
                    "0 0 0 4px oklch(0.72 0.14 190 / 0.2), 0 0 40px oklch(0.72 0.14 190 / 0.35)",
                  background: "rgba(8,18,28,0.85)",
                }}
              >
                {activePhoto ? (
                  <img
                    src={activePhoto}
                    alt="Your profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ color: "oklch(0.55 0.06 200)" }}
                  >
                    <Camera className="w-10 h-10" />
                  </div>
                )}
              </div>
              {/* Upload button overlay */}
              <button
                type="button"
                data-ocid="profile.photo_upload_btn"
                onClick={() => fileInputRef.current?.click()}
                title="Upload your photo"
                className="absolute bottom-0 right-0 w-9 h-9 rounded-full flex items-center justify-center transition-all"
                style={{
                  background: "oklch(0.72 0.14 190)",
                  border: "2px solid rgba(7,19,28,0.9)",
                  boxShadow: "0 2px 12px oklch(0.72 0.14 190 / 0.5)",
                  cursor: "pointer",
                }}
              >
                <Camera className="w-4 h-4" style={{ color: "#07131c" }} />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
              data-ocid="profile.photo_file_input"
            />
            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                data-ocid="profile.upload_photo_text_btn"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-medium transition-colors"
                style={{ color: "oklch(0.72 0.14 190)" }}
              >
                {customPhoto ? "Change photo" : "Upload your photo"}
              </button>
              {customPhoto && (
                <button
                  type="button"
                  data-ocid="profile.remove_photo_btn"
                  onClick={handleRemoveCustomPhoto}
                  className="text-xs flex items-center gap-1 transition-colors"
                  style={{ color: "oklch(0.60 0.12 20)" }}
                >
                  <Trash2 className="w-3 h-3" />
                  Remove
                </button>
              )}
            </div>
            <p
              className="mt-1 text-xs"
              style={{ color: "oklch(0.45 0.02 215)" }}
            >
              Or pick an avatar below
            </p>
          </motion.div>

          {/* Avatar Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="glass-card p-7 mb-5"
            data-ocid="profile.avatar.card"
          >
            <h2
              className="text-sm font-semibold uppercase tracking-widest mb-5"
              style={{ color: "oklch(0.72 0.14 190)" }}
            >
              Choose Avatar
            </h2>
            <div className="flex flex-wrap justify-center gap-5">
              {AVATARS.map((av, i) => (
                <motion.button
                  key={av.id}
                  type="button"
                  data-ocid={`profile.avatar.item.${i + 1}`}
                  onClick={() => {
                    setSelectedAvatar(av.src);
                    setCustomPhoto(""); // clear custom photo when preset is selected
                  }}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, delay: 0.25 + i * 0.06 }}
                  className="flex flex-col items-center gap-2 group"
                  aria-label={`Select ${av.label} avatar`}
                >
                  <div
                    className="relative rounded-full overflow-hidden transition-all duration-300"
                    style={{
                      width: 76,
                      height: 76,
                      border:
                        !customPhoto && selectedAvatar === av.src
                          ? "3px solid oklch(0.72 0.14 190)"
                          : "3px solid rgba(255,255,255,0.08)",
                      boxShadow:
                        !customPhoto && selectedAvatar === av.src
                          ? "0 0 0 3px oklch(0.72 0.14 190 / 0.3), 0 0 30px oklch(0.72 0.14 190 / 0.45)"
                          : "none",
                      transform:
                        !customPhoto && selectedAvatar === av.src
                          ? "scale(1.1)"
                          : "scale(1)",
                    }}
                  >
                    <img
                      src={av.src}
                      alt={av.label}
                      className="w-full h-full object-cover"
                    />
                    {!customPhoto && selectedAvatar === av.src && (
                      <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ background: "oklch(0.72 0.14 190 / 0.18)" }}
                      >
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ background: "oklch(0.72 0.14 190)" }}
                        >
                          <svg
                            viewBox="0 0 12 12"
                            fill="none"
                            className="w-3 h-3"
                            aria-hidden="true"
                          >
                            <path
                              d="M2 6l3 3 5-5"
                              stroke="#07131c"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                  <span
                    className="text-xs font-medium transition-colors"
                    style={{
                      color:
                        !customPhoto && selectedAvatar === av.src
                          ? "oklch(0.80 0.14 190)"
                          : "oklch(0.55 0.025 210)",
                    }}
                  >
                    {av.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Username & Bio */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.3 }}
            className="glass-card p-7 mb-5"
            data-ocid="profile.info.card"
          >
            <h2
              className="text-sm font-semibold uppercase tracking-widest mb-5"
              style={{ color: "oklch(0.72 0.14 190)" }}
            >
              Your Info
            </h2>
            <div className="flex flex-col gap-4">
              <div>
                <label
                  htmlFor="sc-username"
                  className="block text-xs font-medium mb-2"
                  style={{ color: "oklch(0.62 0.04 205)" }}
                >
                  Display Name
                </label>
                <input
                  id="sc-username"
                  type="text"
                  data-ocid="profile.username.input"
                  placeholder="Enter your name…"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  maxLength={32}
                  className="sc-input w-full px-4 py-3 text-sm"
                  style={{
                    background: "rgba(8,18,28,0.7)",
                    border: "1px solid rgba(57,214,208,0.18)",
                    borderRadius: 12,
                    color: "oklch(0.88 0.04 200)",
                    outline: "none",
                  }}
                />
              </div>
              <div>
                <label
                  htmlFor="sc-bio"
                  className="block text-xs font-medium mb-2"
                  style={{ color: "oklch(0.62 0.04 205)" }}
                >
                  Status / Bio
                </label>
                <input
                  id="sc-bio"
                  type="text"
                  data-ocid="profile.bio.input"
                  placeholder="Here to vibe 🌊"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={80}
                  className="sc-input w-full px-4 py-3 text-sm"
                  style={{
                    background: "rgba(8,18,28,0.7)",
                    border: "1px solid rgba(57,214,208,0.18)",
                    borderRadius: 12,
                    color: "oklch(0.88 0.04 200)",
                    outline: "none",
                  }}
                />
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.38 }}
            className="grid grid-cols-3 gap-3 mb-5"
            data-ocid="profile.stats.panel"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.42 + i * 0.07 }}
                data-ocid={`profile.stats.item.${i + 1}`}
                className="glass-card p-5 text-center"
              >
                <div
                  className="text-3xl font-bold font-mono mb-1"
                  style={{ color: "oklch(0.80 0.16 185)" }}
                >
                  {stat.value}
                </div>
                <div
                  className="text-xs leading-tight"
                  style={{ color: "oklch(0.58 0.025 210)" }}
                >
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.46 }}
            className="glass-card p-7 mb-7"
            data-ocid="profile.badges.card"
          >
            <h2
              className="text-sm font-semibold uppercase tracking-widest mb-5"
              style={{ color: "oklch(0.72 0.14 190)" }}
            >
              Achievements
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {BADGES.map((badge, i) => {
                const unlocked = statMap[badge.key] >= badge.threshold;
                return (
                  <motion.div
                    key={badge.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.5 + i * 0.07 }}
                    data-ocid={`profile.badges.item.${i + 1}`}
                    className="relative p-4 rounded-2xl flex flex-col items-center gap-2 text-center transition-all duration-300"
                    style={{
                      background: unlocked
                        ? "rgba(57,214,208,0.06)"
                        : "rgba(8,16,26,0.45)",
                      border: unlocked
                        ? "1px solid rgba(57,214,208,0.28)"
                        : "1px solid rgba(255,255,255,0.05)",
                      boxShadow: unlocked
                        ? "0 0 20px rgba(57,214,208,0.10)"
                        : "none",
                      opacity: unlocked ? 1 : 0.4,
                    }}
                  >
                    {!unlocked && (
                      <div
                        className="absolute top-2 right-2"
                        style={{ color: "oklch(0.50 0.02 215)" }}
                      >
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <span
                      className="text-2xl"
                      role="img"
                      aria-label={badge.label}
                    >
                      {badge.emoji}
                    </span>
                    <div>
                      <div
                        className="text-xs font-bold mb-0.5"
                        style={{
                          color: unlocked
                            ? "oklch(0.82 0.10 190)"
                            : "oklch(0.52 0.02 215)",
                        }}
                      >
                        {badge.label}
                      </div>
                      <div
                        className="text-xs leading-tight"
                        style={{
                          color: unlocked
                            ? "oklch(0.60 0.025 210)"
                            : "oklch(0.40 0.015 215)",
                        }}
                      >
                        {badge.desc}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            className="flex justify-center"
          >
            <button
              type="button"
              data-ocid="profile.save_button"
              onClick={handleSave}
              className="btn-teal flex items-center gap-3 px-10 py-4 text-base"
            >
              <AnimatePresence mode="wait">
                {saved ? (
                  <motion.span
                    key="saved"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    className="flex items-center gap-2"
                  >
                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      className="w-4 h-4"
                      aria-hidden="true"
                    >
                      <path
                        d="M3 8l4 4 6-6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Saved!
                  </motion.span>
                ) : (
                  <motion.span
                    key="save"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Profile
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
