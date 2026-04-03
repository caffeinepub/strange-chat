import { useNavigate, useParams } from "@tanstack/react-router";
import {
  LogOut,
  Mic,
  MicOff,
  Palette,
  Phone,
  PhoneIncoming,
  PhoneMissed,
  PhoneOff,
  Send,
  Timer,
  Trash2,
  Video,
  VideoOff,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Message } from "../backend";
import { getBackend } from "../backend-instance";
import { GlassNav } from "../components/GlassNav";
import { useVideoCall } from "../hooks/useVideoCall";
import { useVoiceCall } from "../hooks/useVoiceCall";

// ── Incoming Call Overlay ─────────────────────────────────────────────────────────────────────────
function IncomingCallOverlay({
  onAccept,
  onDecline,
}: {
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(3,8,16,0.82)", backdropFilter: "blur(8px)" }}
      data-ocid="voicecall.incoming_dialog"
    >
      <motion.div
        initial={{ scale: 0.85, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85, y: 20 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        className="flex flex-col items-center gap-6 p-10 rounded-3xl"
        style={{
          background: "rgba(8,18,30,0.92)",
          border: "1.5px solid rgba(57,214,208,0.30)",
          boxShadow:
            "0 0 60px rgba(57,214,208,0.18), 0 0 120px rgba(57,214,208,0.06)",
          minWidth: 300,
        }}
      >
        {/* Animated ringing icon */}
        <div className="relative flex items-center justify-center">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                border: "2px solid rgba(57,214,208,0.35)",
                width: 60 + i * 28,
                height: 60 + i * 28,
              }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.4,
              }}
            />
          ))}
          <div
            className="relative z-10 w-16 h-16 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(57,214,208,0.14)",
              border: "2px solid rgba(57,214,208,0.45)",
              boxShadow: "0 0 28px rgba(57,214,208,0.30)",
            }}
          >
            <PhoneIncoming
              className="w-7 h-7"
              style={{ color: "oklch(0.75 0.16 188)" }}
            />
          </div>
        </div>

        <div className="text-center">
          <p
            className="text-xl font-bold mb-1"
            style={{ color: "oklch(0.88 0.08 195)" }}
          >
            Incoming Voice Call 📞
          </p>
          <p className="text-sm" style={{ color: "oklch(0.55 0.025 210)" }}>
            Someone in this room wants to talk
          </p>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            data-ocid="voicecall.accept_button"
            onClick={onAccept}
            className="flex items-center gap-2 px-7 py-3 rounded-full font-semibold text-sm transition-all active:scale-95"
            style={{
              background: "rgba(30,200,80,0.18)",
              border: "1.5px solid rgba(30,200,80,0.50)",
              color: "oklch(0.75 0.18 148)",
              boxShadow: "0 0 20px rgba(30,200,80,0.18)",
            }}
          >
            <Phone className="w-4 h-4" /> Accept
          </button>
          <button
            type="button"
            data-ocid="voicecall.decline_button"
            onClick={onDecline}
            className="flex items-center gap-2 px-7 py-3 rounded-full font-semibold text-sm transition-all active:scale-95"
            style={{
              background: "rgba(220,60,40,0.14)",
              border: "1.5px solid rgba(220,60,40,0.40)",
              color: "oklch(0.65 0.22 25)",
              boxShadow: "0 0 20px rgba(220,60,40,0.12)",
            }}
          >
            <PhoneMissed className="w-4 h-4" /> Decline
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Outgoing Call Overlay ──────────────────────────────────────────────────────────────────────────
function OutgoingCallOverlay({ onCancel }: { onCancel: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(3,8,16,0.78)", backdropFilter: "blur(8px)" }}
      data-ocid="voicecall.calling_dialog"
    >
      <motion.div
        initial={{ scale: 0.88, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.88, y: 16 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className="flex flex-col items-center gap-6 p-10 rounded-3xl"
        style={{
          background: "rgba(8,18,30,0.93)",
          border: "1.5px solid rgba(57,214,208,0.25)",
          boxShadow:
            "0 0 60px rgba(57,214,208,0.15), 0 0 120px rgba(57,214,208,0.05)",
          minWidth: 300,
        }}
      >
        {/* Pulsing ring */}
        <div className="relative flex items-center justify-center">
          {[0, 1].map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                border: "2px solid rgba(57,214,208,0.25)",
                width: 64 + i * 32,
                height: 64 + i * 32,
              }}
              animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
              transition={{
                duration: 1.6,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.6,
                ease: "easeOut",
              }}
            />
          ))}
          <motion.div
            animate={{ rotate: [0, -12, 12, -8, 8, 0] }}
            transition={{
              duration: 1.0,
              repeat: Number.POSITIVE_INFINITY,
              repeatDelay: 0.8,
            }}
            className="relative z-10 w-16 h-16 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(57,214,208,0.12)",
              border: "2px solid rgba(57,214,208,0.40)",
              boxShadow: "0 0 28px rgba(57,214,208,0.25)",
            }}
          >
            <Phone
              className="w-7 h-7"
              style={{ color: "oklch(0.72 0.14 190)" }}
            />
          </motion.div>
        </div>

        <div className="text-center">
          <p
            className="text-xl font-bold mb-1"
            style={{ color: "oklch(0.88 0.08 195)" }}
          >
            Calling... 📞
          </p>
          <p className="text-sm" style={{ color: "oklch(0.55 0.025 210)" }}>
            Waiting for the other person to accept
          </p>
        </div>

        {/* Animated dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: "oklch(0.72 0.14 190)" }}
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.15, 0.8] }}
              transition={{
                duration: 1.2,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.25,
              }}
            />
          ))}
        </div>

        <button
          type="button"
          data-ocid="voicecall.cancel_button"
          onClick={onCancel}
          className="flex items-center gap-2 px-7 py-3 rounded-full font-semibold text-sm transition-all active:scale-95"
          style={{
            background: "rgba(220,60,40,0.14)",
            border: "1.5px solid rgba(220,60,40,0.40)",
            color: "oklch(0.65 0.22 25)",
          }}
        >
          <PhoneOff className="w-4 h-4" /> Cancel
        </button>
      </motion.div>
    </motion.div>
  );
}

// ── Active Call Bar ────────────────────────────────────────────────────────────────────────────────
function ActiveCallBar({
  duration,
  isMuted,
  onToggleMute,
  onEnd,
}: {
  duration: string;
  isMuted: boolean;
  onToggleMute: () => void;
  onEnd: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center justify-between gap-4 px-5 py-3 rounded-2xl mb-1"
      style={{
        background: "rgba(10,24,12,0.90)",
        border: "1.5px solid rgba(30,200,80,0.35)",
        boxShadow: "0 0 20px rgba(30,200,80,0.12)",
      }}
      data-ocid="voicecall.active_panel"
    >
      <div className="flex items-center gap-3">
        <motion.div
          className="w-2.5 h-2.5 rounded-full"
          style={{ background: "oklch(0.72 0.20 148)" }}
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.2, repeat: Number.POSITIVE_INFINITY }}
        />
        <span
          className="text-sm font-semibold"
          style={{ color: "oklch(0.80 0.14 148)" }}
        >
          Voice Call Active
        </span>
        <div
          className="flex items-center gap-1 text-xs"
          style={{ color: "oklch(0.65 0.10 148)" }}
        >
          <Timer className="w-3.5 h-3.5" />
          {duration}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          data-ocid="voicecall.mute_toggle"
          onClick={onToggleMute}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95"
          style={{
            background: isMuted
              ? "rgba(220,60,40,0.18)"
              : "rgba(57,214,208,0.10)",
            border: `1.5px solid ${isMuted ? "rgba(220,60,40,0.40)" : "rgba(57,214,208,0.28)"}`,
            color: isMuted ? "oklch(0.65 0.22 25)" : "oklch(0.72 0.14 190)",
          }}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <MicOff className="w-4 h-4" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </button>
        <button
          type="button"
          data-ocid="voicecall.end_button"
          onClick={onEnd}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all active:scale-95"
          style={{
            background: "rgba(220,60,40,0.16)",
            border: "1.5px solid rgba(220,60,40,0.40)",
            color: "oklch(0.65 0.22 25)",
          }}
        >
          <PhoneOff className="w-3.5 h-3.5" /> End Call
        </button>
      </div>
    </motion.div>
  );
}

// ── Incoming Video Call Overlay ─────────────────────────────────────────────────────────────────────
function IncomingVideoCallOverlay({
  onAccept,
  onDecline,
}: {
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(3,8,16,0.82)", backdropFilter: "blur(8px)" }}
      data-ocid="videocall.incoming_dialog"
    >
      <motion.div
        initial={{ scale: 0.85, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85, y: 20 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        className="flex flex-col items-center gap-6 p-10 rounded-3xl"
        style={{
          background: "rgba(8,18,30,0.92)",
          border: "1.5px solid rgba(57,214,208,0.30)",
          boxShadow:
            "0 0 60px rgba(57,214,208,0.18), 0 0 120px rgba(57,214,208,0.06)",
          minWidth: 300,
        }}
      >
        {/* Animated ringing icon */}
        <div className="relative flex items-center justify-center">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                border: "2px solid rgba(57,214,208,0.35)",
                width: 60 + i * 28,
                height: 60 + i * 28,
              }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.4,
              }}
            />
          ))}
          <div
            className="relative z-10 w-16 h-16 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(57,214,208,0.14)",
              border: "2px solid rgba(57,214,208,0.45)",
              boxShadow: "0 0 28px rgba(57,214,208,0.30)",
            }}
          >
            <Video
              className="w-7 h-7"
              style={{ color: "oklch(0.75 0.16 188)" }}
            />
          </div>
        </div>

        <div className="text-center">
          <p
            className="text-xl font-bold mb-1"
            style={{ color: "oklch(0.88 0.08 195)" }}
          >
            Incoming Video Call 📹
          </p>
          <p className="text-sm" style={{ color: "oklch(0.55 0.025 210)" }}>
            Someone in this room wants to video chat
          </p>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            data-ocid="videocall.accept_button"
            onClick={onAccept}
            className="flex items-center gap-2 px-7 py-3 rounded-full font-semibold text-sm transition-all active:scale-95"
            style={{
              background: "rgba(30,200,80,0.18)",
              border: "1.5px solid rgba(30,200,80,0.50)",
              color: "oklch(0.75 0.18 148)",
              boxShadow: "0 0 20px rgba(30,200,80,0.18)",
            }}
          >
            <Video className="w-4 h-4" /> Accept
          </button>
          <button
            type="button"
            data-ocid="videocall.decline_button"
            onClick={onDecline}
            className="flex items-center gap-2 px-7 py-3 rounded-full font-semibold text-sm transition-all active:scale-95"
            style={{
              background: "rgba(220,60,40,0.14)",
              border: "1.5px solid rgba(220,60,40,0.40)",
              color: "oklch(0.65 0.22 25)",
              boxShadow: "0 0 20px rgba(220,60,40,0.12)",
            }}
          >
            <VideoOff className="w-4 h-4" /> Decline
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Outgoing Video Call Overlay ──────────────────────────────────────────────────────────────────────
function OutgoingVideoCallOverlay({ onCancel }: { onCancel: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(3,8,16,0.78)", backdropFilter: "blur(8px)" }}
      data-ocid="videocall.calling_dialog"
    >
      <motion.div
        initial={{ scale: 0.88, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.88, y: 16 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className="flex flex-col items-center gap-6 p-10 rounded-3xl"
        style={{
          background: "rgba(8,18,30,0.93)",
          border: "1.5px solid rgba(57,214,208,0.25)",
          boxShadow:
            "0 0 60px rgba(57,214,208,0.15), 0 0 120px rgba(57,214,208,0.05)",
          minWidth: 300,
        }}
      >
        {/* Pulsing ring */}
        <div className="relative flex items-center justify-center">
          {[0, 1].map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                border: "2px solid rgba(57,214,208,0.25)",
                width: 64 + i * 32,
                height: 64 + i * 32,
              }}
              animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
              transition={{
                duration: 1.6,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.6,
                ease: "easeOut",
              }}
            />
          ))}
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{
              duration: 1.2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className="relative z-10 w-16 h-16 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(57,214,208,0.12)",
              border: "2px solid rgba(57,214,208,0.40)",
              boxShadow: "0 0 28px rgba(57,214,208,0.25)",
            }}
          >
            <Video
              className="w-7 h-7"
              style={{ color: "oklch(0.72 0.14 190)" }}
            />
          </motion.div>
        </div>

        <div className="text-center">
          <p
            className="text-xl font-bold mb-1"
            style={{ color: "oklch(0.88 0.08 195)" }}
          >
            Video Calling... 📹
          </p>
          <p className="text-sm" style={{ color: "oklch(0.55 0.025 210)" }}>
            Waiting for the other person to accept
          </p>
        </div>

        {/* Animated dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: "oklch(0.72 0.14 190)" }}
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.15, 0.8] }}
              transition={{
                duration: 1.2,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.25,
              }}
            />
          ))}
        </div>

        <button
          type="button"
          data-ocid="videocall.cancel_button"
          onClick={onCancel}
          className="flex items-center gap-2 px-7 py-3 rounded-full font-semibold text-sm transition-all active:scale-95"
          style={{
            background: "rgba(220,60,40,0.14)",
            border: "1.5px solid rgba(220,60,40,0.40)",
            color: "oklch(0.65 0.22 25)",
          }}
        >
          <VideoOff className="w-4 h-4" /> Cancel
        </button>
      </motion.div>
    </motion.div>
  );
}

// ── Active Video Call Overlay ────────────────────────────────────────────────────────────────────────
function ActiveVideoCallOverlay({
  duration,
  isMuted,
  isCamOff,
  onToggleMute,
  onToggleCamera,
  onEnd,
  setLocalStreamCallback,
  setRemoteStreamCallback,
}: {
  duration: string;
  isMuted: boolean;
  isCamOff: boolean;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onEnd: () => void;
  setLocalStreamCallback: (cb: (stream: MediaStream) => void) => void;
  setRemoteStreamCallback: (cb: (stream: MediaStream) => void) => void;
}) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [hasRemote, setHasRemote] = useState(false);

  useEffect(() => {
    setLocalStreamCallback((stream) => {
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    });
    setRemoteStreamCallback((stream) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
      setHasRemote(true);
    });
  }, [setLocalStreamCallback, setRemoteStreamCallback]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "rgba(2,6,14,0.96)", backdropFilter: "blur(12px)" }}
      data-ocid="videocall.active_panel"
    >
      {/* Remote video — takes most of screen */}
      <div className="relative flex-1 flex items-center justify-center">
        {hasRemote ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
            style={{ maxHeight: "calc(100vh - 120px)" }}
          >
            <track kind="captions" />
          </video>
        ) : (
          <div className="flex flex-col items-center gap-5">
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 1.8, repeat: Number.POSITIVE_INFINITY }}
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(57,214,208,0.10)",
                border: "2px solid rgba(57,214,208,0.30)",
                boxShadow: "0 0 40px rgba(57,214,208,0.18)",
              }}
            >
              <Video
                className="w-10 h-10"
                style={{ color: "oklch(0.72 0.14 190)" }}
              />
            </motion.div>
            <p
              className="text-base font-medium"
              style={{ color: "oklch(0.60 0.025 210)" }}
            >
              Waiting for remote video...
            </p>
          </div>
        )}

        {/* Local video PiP — bottom-right corner */}
        <div
          className="absolute bottom-4 right-4 rounded-2xl overflow-hidden"
          style={{
            width: 160,
            height: 112,
            border: "2px solid rgba(57,214,208,0.45)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.55)",
            background: "#000",
          }}
        >
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <div
            className="absolute bottom-1.5 left-2 text-xs font-semibold"
            style={{ color: "rgba(255,255,255,0.80)" }}
          >
            You
          </div>
        </div>

        {/* Timer top-center */}
        <div
          className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1.5 rounded-full"
          style={{
            background: "rgba(8,18,30,0.75)",
            border: "1px solid rgba(57,214,208,0.22)",
          }}
        >
          <motion.div
            className="w-2 h-2 rounded-full"
            style={{ background: "oklch(0.72 0.20 148)" }}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.2, repeat: Number.POSITIVE_INFINITY }}
          />
          <Timer
            className="w-3.5 h-3.5"
            style={{ color: "oklch(0.65 0.10 148)" }}
          />
          <span
            className="text-sm font-mono font-semibold"
            style={{ color: "oklch(0.80 0.14 148)" }}
          >
            {duration}
          </span>
        </div>
      </div>

      {/* Controls bar */}
      <div
        className="flex items-center justify-center gap-4 py-5 px-6"
        style={{
          background: "rgba(8,18,30,0.92)",
          borderTop: "1px solid rgba(57,214,208,0.18)",
        }}
      >
        {/* Mute toggle */}
        <button
          type="button"
          data-ocid="videocall.mute_toggle"
          onClick={onToggleMute}
          className="w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-95"
          style={{
            background: isMuted
              ? "rgba(220,60,40,0.18)"
              : "rgba(57,214,208,0.10)",
            border: `2px solid ${isMuted ? "rgba(220,60,40,0.45)" : "rgba(57,214,208,0.30)"}`,
            color: isMuted ? "oklch(0.65 0.22 25)" : "oklch(0.72 0.14 190)",
          }}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <MicOff className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </button>

        {/* Camera toggle */}
        <button
          type="button"
          data-ocid="videocall.camera_toggle"
          onClick={onToggleCamera}
          className="w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-95"
          style={{
            background: isCamOff
              ? "rgba(220,60,40,0.18)"
              : "rgba(57,214,208,0.10)",
            border: `2px solid ${isCamOff ? "rgba(220,60,40,0.45)" : "rgba(57,214,208,0.30)"}`,
            color: isCamOff ? "oklch(0.65 0.22 25)" : "oklch(0.72 0.14 190)",
          }}
          title={isCamOff ? "Turn Camera On" : "Turn Camera Off"}
        >
          {isCamOff ? (
            <VideoOff className="w-5 h-5" />
          ) : (
            <Video className="w-5 h-5" />
          )}
        </button>

        {/* End video call */}
        <button
          type="button"
          data-ocid="videocall.end_button"
          onClick={onEnd}
          className="flex items-center gap-2 px-8 py-3 rounded-full font-semibold text-sm transition-all active:scale-95"
          style={{
            background: "rgba(220,60,40,0.20)",
            border: "2px solid rgba(220,60,40,0.50)",
            color: "oklch(0.65 0.22 25)",
            boxShadow: "0 0 24px rgba(220,60,40,0.18)",
          }}
        >
          <VideoOff className="w-5 h-5" /> End Video
        </button>
      </div>
    </motion.div>
  );
}

// ── Guess the Number Game ───────────────────────────────────────────────────────────────
function GuessNumberGame() {
  const [secret] = useState(() => Math.floor(Math.random() * 10) + 1);
  const [guess, setGuess] = useState("");
  const [result, setResult] = useState<"" | "win" | "lose">("");
  const [used, setUsed] = useState(false);

  const handleGuess = () => {
    if (!guess || used) return;
    const num = Number.parseInt(guess, 10);
    setResult(num === secret ? "win" : "lose");
    setUsed(true);
  };
  const reset = () => {
    setGuess("");
    setResult("");
    setUsed(false);
  };

  return (
    <div
      className="p-4 rounded-xl space-y-3"
      style={{
        background: "rgba(8,18,28,0.55)",
        border: "1px solid rgba(57,214,208,0.12)",
      }}
    >
      <h4
        className="font-semibold text-sm"
        style={{ color: "oklch(0.78 0.10 190)" }}
      >
        🎯 Guess the Number (1–10)
      </h4>
      <div className="flex gap-2">
        <input
          type="number"
          data-ocid="chat.guess_input"
          min={1}
          max={10}
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          placeholder="1-10"
          disabled={used}
          className="sc-input px-3 py-2 text-sm w-20 text-center"
        />
        <button
          type="button"
          data-ocid="chat.guess_button"
          onClick={handleGuess}
          disabled={used}
          className="btn-teal px-4 py-2 text-sm disabled:opacity-50"
        >
          Guess
        </button>
        {used && (
          <button
            type="button"
            data-ocid="chat.guess_reset_button"
            onClick={reset}
            className="btn-navy-outline px-4 py-2 text-sm"
          >
            Again
          </button>
        )}
      </div>
      {result && (
        <div
          className="text-sm font-semibold"
          style={{
            color:
              result === "win" ? "oklch(0.78 0.16 150)" : "oklch(0.65 0.22 25)",
          }}
        >
          {result === "win"
            ? "🎉 You guessed it!"
            : `❌ Wrong! It was ${secret}`}
        </div>
      )}
    </div>
  );
}

// ── Rock Paper Scissors ───────────────────────────────────────────────────────────────────
const RPS_CHOICES = ["✊ Rock", "✋ Paper", "✌️ Scissors"] as const;
type RPSChoice = (typeof RPS_CHOICES)[number];
function getRPSResult(p: RPSChoice, c: RPSChoice) {
  if (p === c) return "draw";
  if (
    (p === "✊ Rock" && c === "✌️ Scissors") ||
    (p === "✋ Paper" && c === "✊ Rock") ||
    (p === "✌️ Scissors" && c === "✋ Paper")
  )
    return "win";
  return "lose";
}
function RockPaperScissors() {
  const [pChoice, setPChoice] = useState<RPSChoice | null>(null);
  const [cChoice, setCChoice] = useState<RPSChoice | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const play = (c: RPSChoice) => {
    const comp = RPS_CHOICES[Math.floor(Math.random() * 3)];
    setPChoice(c);
    setCChoice(comp);
    setResult(getRPSResult(c, comp));
  };
  const reset = () => {
    setPChoice(null);
    setCChoice(null);
    setResult(null);
  };
  return (
    <div
      className="p-4 rounded-xl space-y-3"
      style={{
        background: "rgba(8,18,28,0.55)",
        border: "1px solid rgba(57,214,208,0.12)",
      }}
    >
      <h4
        className="font-semibold text-sm"
        style={{ color: "oklch(0.78 0.10 190)" }}
      >
        ✊ Rock Paper Scissors
      </h4>
      {!result ? (
        <div className="flex gap-2 flex-wrap">
          {RPS_CHOICES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => play(c)}
              className="btn-navy-outline px-3 py-2 text-sm"
            >
              {c}
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-4 text-sm">
            <span style={{ color: "oklch(0.72 0.08 200)" }}>
              You: {pChoice}
            </span>
            <span style={{ color: "oklch(0.58 0.025 210)" }}>
              CPU: {cChoice}
            </span>
          </div>
          <div
            className="font-bold text-sm"
            style={{
              color:
                result === "win"
                  ? "oklch(0.78 0.16 150)"
                  : result === "lose"
                    ? "oklch(0.65 0.22 25)"
                    : "oklch(0.72 0.08 200)",
            }}
          >
            {result === "win"
              ? "🎉 You win!"
              : result === "lose"
                ? "😢 You lose!"
                : "🤝 Draw!"}
          </div>
          <button
            type="button"
            onClick={reset}
            className="btn-teal px-4 py-2 text-sm"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}

// ── Word Scramble Game ─────────────────────────────────────────────────────────────────────
const WORDS = [
  "PLANET",
  "GUITAR",
  "CASTLE",
  "ROCKET",
  "BRIDGE",
  "JUNGLE",
  "WIZARD",
  "MIRROR",
  "CANDLE",
  "FOREST",
];
function scramble(w: string) {
  const a = w.split("");
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  const s = a.join("");
  return s === w ? scramble(w) : s;
}
function WordScrambleGame() {
  const [idx, setIdx] = useState(() =>
    Math.floor(Math.random() * WORDS.length),
  );
  const [scrambled, setScrambled] = useState(() => scramble(WORDS[idx]));
  const [guess, setGuess] = useState("");
  const [result, setResult] = useState<"" | "win" | "lose">("");
  const [revealed, setRevealed] = useState(false);

  const check = () => {
    if (!guess.trim()) return;
    if (guess.trim().toUpperCase() === WORDS[idx]) {
      setResult("win");
    } else {
      setResult("lose");
      setRevealed(true);
    }
  };

  const next = () => {
    const newIdx = Math.floor(Math.random() * WORDS.length);
    setIdx(newIdx);
    setScrambled(scramble(WORDS[newIdx]));
    setGuess("");
    setResult("");
    setRevealed(false);
  };

  return (
    <div
      className="p-4 rounded-xl space-y-3"
      style={{
        background: "rgba(8,18,28,0.55)",
        border: "1px solid rgba(57,214,208,0.12)",
      }}
    >
      <h4
        className="font-semibold text-sm"
        style={{ color: "oklch(0.78 0.10 190)" }}
      >
        🔤 Word Scramble
      </h4>
      <div
        className="font-mono text-lg font-bold tracking-[0.35em] text-center py-2"
        style={{ color: "oklch(0.82 0.14 185)", letterSpacing: "0.4em" }}
      >
        {scrambled}
      </div>
      {!result ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && check()}
            placeholder="Unscramble it..."
            className="sc-input px-3 py-2 text-sm flex-1 uppercase"
          />
          <button
            type="button"
            onClick={check}
            className="btn-teal px-4 py-2 text-sm"
          >
            Check
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div
            className="text-sm font-semibold"
            style={{
              color:
                result === "win"
                  ? "oklch(0.78 0.16 150)"
                  : "oklch(0.65 0.22 25)",
            }}
          >
            {result === "win"
              ? "🎉 Correct!"
              : `❌ Wrong! It was: ${WORDS[idx]}`}
          </div>
          <button
            type="button"
            onClick={next}
            className="btn-teal px-4 py-2 text-sm"
          >
            Next Word
          </button>
        </div>
      )}
      {revealed && <div />}
    </div>
  );
}

// ── Emoji Quiz ───────────────────────────────────────────────────────────────────────────────────────────
const EMOJI_Q = [
  {
    emoji: "🎬🌟",
    answer: "Movie Star",
    opts: ["Movie Star", "Space Travel", "Shooting Star", "Night Cinema"],
  },
  {
    emoji: "🌊🏄",
    answer: "Surfing",
    opts: ["Surfing", "Swimming", "Tsunami", "Water Park"],
  },
  {
    emoji: "🐍🎮",
    answer: "Snake Game",
    opts: ["Snake Game", "Reptile Park", "Game Over", "Python Code"],
  },
  {
    emoji: "🌙✨",
    answer: "Moonlight",
    opts: ["Moonlight", "Galaxy", "Night Sky", "Starlight"],
  },
  {
    emoji: "🎵❤️",
    answer: "Love Song",
    opts: ["Love Song", "Music Box", "Karaoke", "Heartbeat"],
  },
  {
    emoji: "👷💡",
    answer: "Smart Builder",
    opts: ["Smart Builder", "Genius Worker", "Hard Hat", "Bright Idea"],
  },
  {
    emoji: "✈️💰",
    answer: "Rich Traveler",
    opts: ["Rich Traveler", "Flight Cost", "Air Money", "Paid Trip"],
  },
  {
    emoji: "🤜📸",
    answer: "Selfie",
    opts: ["Selfie", "Photo Bomb", "Camera Left", "Mirror Shot"],
  },
];
function EmojiQuizGame() {
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const q = EMOJI_Q[qIdx];
  const done = qIdx >= EMOJI_Q.length;

  const pick = (opt: string) => {
    if (selected) return;
    setSelected(opt);
    if (opt === q.answer) setScore((s) => s + 1);
    setTimeout(() => {
      setQIdx((i) => i + 1);
      setSelected(null);
    }, 900);
  };

  const restart = () => {
    setQIdx(0);
    setScore(0);
    setSelected(null);
  };

  return (
    <div
      className="p-4 rounded-xl space-y-3"
      style={{
        background: "rgba(8,18,28,0.55)",
        border: "1px solid rgba(57,214,208,0.12)",
      }}
    >
      <div className="flex items-center justify-between">
        <h4
          className="font-semibold text-sm"
          style={{ color: "oklch(0.78 0.10 190)" }}
        >
          🎉 Emoji Quiz
        </h4>
        <span className="text-xs" style={{ color: "oklch(0.58 0.025 210)" }}>
          {Math.min(qIdx + 1, EMOJI_Q.length)}/{EMOJI_Q.length}
        </span>
      </div>
      {done ? (
        <div className="text-center space-y-2">
          <div className="text-2xl">🏆</div>
          <div
            className="font-semibold text-sm"
            style={{ color: "oklch(0.80 0.12 190)" }}
          >
            Score: {score}/{EMOJI_Q.length}
          </div>
          <button
            type="button"
            onClick={restart}
            className="btn-teal px-4 py-2 text-sm"
          >
            Play Again
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-3xl text-center py-1">{q.emoji}</div>
          <div className="grid grid-cols-2 gap-2">
            {q.opts.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => pick(opt)}
                className="px-3 py-2 rounded-lg text-xs font-medium transition-all"
                style={{
                  background:
                    selected === null
                      ? "rgba(57,214,208,0.08)"
                      : opt === q.answer
                        ? "rgba(30,200,80,0.20)"
                        : selected === opt
                          ? "rgba(220,60,40,0.15)"
                          : "rgba(57,214,208,0.06)",
                  border: `1px solid ${selected === null ? "rgba(57,214,208,0.18)" : opt === q.answer ? "rgba(30,200,80,0.40)" : selected === opt ? "rgba(220,60,40,0.35)" : "rgba(57,214,208,0.10)"}`,
                  color: "oklch(0.82 0.06 200)",
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Coin Flip Game ──────────────────────────────────────────────────────────────────────────────────────
function CoinFlipGame() {
  const [choice, setChoice] = useState<"Heads" | "Tails" | null>(null);
  const [result, setResult] = useState<"Heads" | "Tails" | null>(null);
  const [flipping, setFlipping] = useState(false);
  const [streak, setStreak] = useState(0);
  const [wins, setWins] = useState(0);

  const flip = (c: "Heads" | "Tails") => {
    if (flipping) return;
    setChoice(c);
    setFlipping(true);
    setTimeout(() => {
      const r: "Heads" | "Tails" = Math.random() < 0.5 ? "Heads" : "Tails";
      setResult(r);
      setFlipping(false);
      if (r === c) {
        setStreak((s) => s + 1);
        setWins((w) => w + 1);
      } else setStreak(0);
    }, 900);
  };

  const reset = () => {
    setChoice(null);
    setResult(null);
    setStreak(0);
    setWins(0);
  };

  return (
    <div
      className="p-4 rounded-xl space-y-3"
      style={{
        background: "rgba(8,18,28,0.55)",
        border: "1px solid rgba(57,214,208,0.12)",
      }}
    >
      <div className="flex items-center justify-between">
        <h4
          className="font-semibold text-sm"
          style={{ color: "oklch(0.78 0.10 190)" }}
        >
          🪙 Coin Flip
        </h4>
        <span className="text-xs" style={{ color: "oklch(0.58 0.025 210)" }}>
          Wins: {wins} | Streak: {streak}🔥
        </span>
      </div>
      <div className="flex items-center justify-center py-2">
        <div
          className={flipping ? "coin-flip-anim" : ""}
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: result
              ? result === "Heads"
                ? "linear-gradient(135deg, #f7d060, #e8a020)"
                : "linear-gradient(135deg, #c0c8d0, #8899aa)"
              : "linear-gradient(135deg, oklch(0.72 0.14 190), oklch(0.55 0.18 185))",
            border: "3px solid rgba(255,255,255,0.15)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
          }}
        >
          {result ? (result === "Heads" ? "👑" : "☆") : "?"}
        </div>
      </div>
      {result && choice && (
        <div
          className="text-center text-sm font-semibold"
          style={{
            color:
              result === choice
                ? "oklch(0.78 0.16 150)"
                : "oklch(0.65 0.22 25)",
          }}
        >
          {result === choice
            ? `🎉 ${result}! You win!`
            : `😢 ${result}! You lose!`}
        </div>
      )}
      {!flipping && (
        <div className="flex gap-2 justify-center flex-wrap">
          <button
            type="button"
            onClick={() => flip("Heads")}
            className="btn-teal px-4 py-2 text-sm"
          >
            👑 Heads
          </button>
          <button
            type="button"
            onClick={() => flip("Tails")}
            className="btn-navy-outline px-4 py-2 text-sm"
          >
            ☆ Tails
          </button>
          {(wins > 0 || streak > 0) && (
            <button
              type="button"
              onClick={reset}
              className="px-3 py-2 text-xs rounded-lg"
              style={{
                background: "rgba(57,214,208,0.08)",
                border: "1px solid rgba(57,214,208,0.18)",
                color: "oklch(0.65 0.06 200)",
              }}
            >
              Reset
            </button>
          )}
        </div>
      )}
      {flipping && (
        <div
          className="text-center text-sm"
          style={{ color: "oklch(0.65 0.06 200)" }}
        >
          Flipping...
        </div>
      )}
    </div>
  );
}

// ── Drawing Canvas ────────────────────────────────────────────────────────────────────────────────────
function DrawingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const [color, setColor] = useState("#39D6D0");
  const [brushSize, setBrushSize] = useState(4);
  const colorRef = useRef(color);
  const brushRef = useRef(brushSize);
  colorRef.current = color;
  brushRef.current = brushSize;

  const getPos = useCallback(
    (canvas: HTMLCanvasElement, e: MouseEvent | Touch) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height),
      };
    },
    [],
  );

  const startDraw = useCallback((pos: { x: number; y: number }) => {
    isDrawing.current = true;
    lastPos.current = pos;
  }, []);
  const draw = useCallback((pos: { x: number; y: number }) => {
    if (!isDrawing.current || !lastPos.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = colorRef.current;
    ctx.lineWidth = brushRef.current;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPos.current = pos;
  }, []);
  const stopDraw = useCallback(() => {
    isDrawing.current = false;
    lastPos.current = null;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onMD = (e: MouseEvent) => startDraw(getPos(canvas, e));
    const onMM = (e: MouseEvent) => draw(getPos(canvas, e));
    const onMU = () => stopDraw();
    const onTS = (e: TouchEvent) => {
      e.preventDefault();
      startDraw(getPos(canvas, e.touches[0]));
    };
    const onTM = (e: TouchEvent) => {
      e.preventDefault();
      draw(getPos(canvas, e.touches[0]));
    };
    canvas.addEventListener("mousedown", onMD);
    canvas.addEventListener("mousemove", onMM);
    canvas.addEventListener("mouseup", onMU);
    canvas.addEventListener("mouseleave", onMU);
    canvas.addEventListener("touchstart", onTS, { passive: false });
    canvas.addEventListener("touchmove", onTM, { passive: false });
    canvas.addEventListener("touchend", onMU);
    return () => {
      canvas.removeEventListener("mousedown", onMD);
      canvas.removeEventListener("mousemove", onMM);
      canvas.removeEventListener("mouseup", onMU);
      canvas.removeEventListener("mouseleave", onMU);
      canvas.removeEventListener("touchstart", onTS);
      canvas.removeEventListener("touchmove", onTM);
      canvas.removeEventListener("touchend", onMU);
    };
  }, [startDraw, draw, stopDraw, getPos]);

  const clearCanvas = () => {
    const c = canvasRef.current;
    if (!c) return;
    c.getContext("2d")?.clearRect(0, 0, c.width, c.height);
  };
  const COLORS = [
    "#39D6D0",
    "#67F0E6",
    "#ffffff",
    "#f87171",
    "#fbbf24",
    "#34d399",
    "#a78bfa",
    "#f472b6",
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          <Palette
            className="w-4 h-4"
            style={{ color: "oklch(0.65 0.06 205)" }}
          />
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              data-ocid="chat.drawing_color_toggle"
              onClick={() => setColor(c)}
              className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110"
              style={{
                background: c,
                borderColor: color === c ? "white" : "transparent",
              }}
            />
          ))}
        </div>
        <div className="flex items-center gap-1.5 ml-2">
          {[2, 4, 8, 14].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setBrushSize(s)}
              className="rounded-full transition-all"
              style={{
                width: s + 7,
                height: s + 7,
                background: brushSize === s ? color : "rgba(57,214,208,0.18)",
                border: `2px solid ${brushSize === s ? color : "rgba(57,214,208,0.25)"}`,
              }}
            />
          ))}
        </div>
        <button
          type="button"
          data-ocid="chat.clear_canvas_button"
          onClick={clearCanvas}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
          style={{
            background: "rgba(220,60,40,0.10)",
            border: "1px solid rgba(220,60,40,0.22)",
            color: "oklch(0.65 0.22 25)",
          }}
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={800}
        height={320}
        data-ocid="chat.canvas_target"
        className="drawing-canvas w-full rounded-xl"
        style={{
          background: "rgba(4,10,18,0.90)",
          border: "1px solid rgba(57,214,208,0.14)",
          height: "190px",
        }}
      />
    </div>
  );
}

// ── Chat Room Page ───────────────────────────────────────────────────────────────────────────────────
export function ChatRoomPage() {
  const { roomCode } = useParams({ strict: false }) as { roomCode: string };
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const myName = localStorage.getItem("strangechat_username") || "You";
  const myDisplayName = localStorage.getItem("sc_username") || myName;
  const myAvatar = localStorage.getItem("sc_avatar") || "";
  const call = useVoiceCall(roomCode);
  const videoCall = useVideoCall(roomCode);

  useEffect(() => {
    const fetch = async () => {
      try {
        const backend = await getBackend();
        const msgs = await backend.getRoomMessages(BigInt(roomCode));
        setMessages(msgs);
        requestAnimationFrame(() =>
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        );
      } catch (e) {
        console.error(e);
      }
    };
    fetch();
    const interval = setInterval(fetch, 2000);
    return () => clearInterval(interval);
  }, [roomCode]);

  const handleSend = async () => {
    if (!newMessage.trim() || isSending) return;
    const msg = newMessage.trim();
    setNewMessage("");
    setIsSending(true);
    try {
      (await getBackend()).sendMessage(BigInt(roomCode), msg);
    } catch (e) {
      console.error(e);
      toast.error("Failed to send");
      setNewMessage(msg);
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const formatTime = (ts: bigint) => {
    const ms = Number(ts);
    const isNano = ms > 1e15;
    const date = new Date(isNano ? ms / 1_000_000 : ms);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      {/* Voice Call Overlays */}
      <AnimatePresence>
        {call.callState === "incoming" && (
          <IncomingCallOverlay
            onAccept={call.acceptCall}
            onDecline={call.declineCall}
          />
        )}
        {call.callState === "calling" && (
          <OutgoingCallOverlay onCancel={call.endCall} />
        )}
      </AnimatePresence>

      {/* Video Call Overlays */}
      <AnimatePresence>
        {videoCall.videoCallState === "incoming" && (
          <IncomingVideoCallOverlay
            onAccept={videoCall.acceptVideoCall}
            onDecline={videoCall.declineVideoCall}
          />
        )}
        {videoCall.videoCallState === "calling" && (
          <OutgoingVideoCallOverlay onCancel={videoCall.endVideoCall} />
        )}
        {videoCall.videoCallState === "active" && (
          <ActiveVideoCallOverlay
            duration={videoCall.fmtDuration(videoCall.callDuration)}
            isMuted={videoCall.isMuted}
            isCamOff={videoCall.isCamOff}
            onToggleMute={videoCall.toggleMute}
            onToggleCamera={videoCall.toggleCamera}
            onEnd={videoCall.endVideoCall}
            setLocalStreamCallback={videoCall.setLocalStreamCallback}
            setRemoteStreamCallback={videoCall.setRemoteStreamCallback}
          />
        )}
      </AnimatePresence>

      <div className="inner-bg min-h-screen flex flex-col">
        {/* Decorative orbs */}
        <div
          className="orb"
          style={{
            width: 300,
            height: 300,
            top: -80,
            right: -60,
            background: "oklch(0.50 0.14 190 / 0.07)",
            filter: "blur(80px)",
            position: "fixed",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        <div
          className="orb"
          style={{
            width: 250,
            height: 250,
            bottom: 60,
            left: -60,
            background: "oklch(0.48 0.16 200 / 0.06)",
            filter: "blur(70px)",
            position: "fixed",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        <GlassNav />
        <div className="relative z-10 flex flex-col flex-1 pt-16">
          <div className="max-w-4xl mx-auto w-full flex flex-col flex-1 px-4 py-4 gap-4">
            {/* Room header */}
            <div
              className="flex items-center justify-between p-4 rounded-2xl"
              style={{
                background: "rgba(8,18,28,0.80)",
                border: "1px solid rgba(57,214,208,0.18)",
                boxShadow: "0 0 30px rgba(57,214,208,0.07)",
              }}
            >
              <div className="flex items-center gap-3">
                {/* User avatar + name badge */}
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
                <div>
                  <span
                    className="text-xs font-medium"
                    style={{ color: "oklch(0.58 0.025 210)" }}
                  >
                    Room Code
                  </span>
                  <div
                    className="font-mono font-bold text-xl tracking-[0.22em]"
                    style={{ color: "oklch(0.80 0.16 185)" }}
                  >
                    {roomCode}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Voice call button */}
                {call.callState === "idle" && (
                  <button
                    type="button"
                    data-ocid="voicecall.start_button"
                    onClick={call.startCall}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all active:scale-95"
                    style={{
                      background: "rgba(30,200,80,0.14)",
                      border: "1.5px solid rgba(30,200,80,0.40)",
                      color: "oklch(0.75 0.18 148)",
                    }}
                    title="Start Voice Call"
                  >
                    <Phone className="w-4 h-4" /> Call
                  </button>
                )}
                {/* Video call button — only when idle */}
                {videoCall.videoCallState === "idle" && (
                  <button
                    type="button"
                    data-ocid="videocall.start_button"
                    onClick={videoCall.startVideoCall}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all active:scale-95"
                    style={{
                      background: "rgba(57,214,208,0.12)",
                      border: "1.5px solid rgba(57,214,208,0.30)",
                      color: "oklch(0.72 0.14 190)",
                    }}
                    title="Start Video Call"
                  >
                    <Video className="w-4 h-4" /> Video
                  </button>
                )}
                <button
                  type="button"
                  data-ocid="chat.leave_button"
                  onClick={() => navigate({ to: "/" })}
                  className="btn-danger flex items-center gap-2 px-5 py-2.5 text-sm"
                >
                  <LogOut className="w-4 h-4" /> Leave
                </button>
              </div>
            </div>

            {/* Voice call bar */}
            <AnimatePresence>
              {call.callState === "active" && (
                <ActiveCallBar
                  duration={call.fmtDuration(call.callDuration)}
                  isMuted={call.isMuted}
                  onToggleMute={call.toggleMute}
                  onEnd={call.endCall}
                />
              )}
            </AnimatePresence>

            {/* Main grid */}
            <div className="grid lg:grid-cols-[1fr_380px] gap-4 flex-1 min-h-0">
              {/* Chat panel */}
              <div
                className="flex flex-col rounded-2xl overflow-hidden"
                style={{
                  background: "rgba(6,14,22,0.85)",
                  border: "1px solid rgba(57,214,208,0.12)",
                  minHeight: "400px",
                }}
              >
                <div
                  className="flex-1 overflow-y-auto p-4 space-y-3"
                  style={{ maxHeight: "calc(100vh - 340px)" }}
                  data-ocid="chat.list"
                >
                  {messages.length === 0 ? (
                    <div
                      className="flex flex-col items-center justify-center h-32 gap-3"
                      data-ocid="chat.empty_state"
                    >
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{
                          background: "rgba(57,214,208,0.08)",
                          border: "1px solid rgba(57,214,208,0.20)",
                        }}
                      >
                        <Send
                          className="w-5 h-5"
                          style={{ color: "oklch(0.65 0.10 190)" }}
                        />
                      </div>
                      <p
                        className="text-sm"
                        style={{ color: "oklch(0.52 0.022 210)" }}
                      >
                        No messages yet. Start the conversation!
                      </p>
                    </div>
                  ) : (
                    messages.map((msg, i) => {
                      const isMine = msg.sender === myName;
                      return (
                        <motion.div
                          key={`${i}-${msg.timestamp}`}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                          data-ocid={`chat.item.${i + 1}`}
                        >
                          <div
                            className={`max-w-[75%] px-4 py-3 ${isMine ? "chat-bubble-self" : "chat-bubble-other"}`}
                          >
                            <div
                              className="text-xs font-semibold mb-1"
                              style={{
                                color: isMine
                                  ? "oklch(0.75 0.12 185)"
                                  : "oklch(0.60 0.025 210)",
                              }}
                            >
                              {msg.sender}
                            </div>
                            <div
                              className="text-sm leading-relaxed break-words"
                              style={{ color: "oklch(0.88 0.012 210)" }}
                            >
                              {msg.content}
                            </div>
                            <div
                              className="text-xs mt-1.5 text-right"
                              style={{ color: "oklch(0.48 0.018 215)" }}
                            >
                              {formatTime(msg.timestamp)}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <div
                  className="p-4 flex gap-3"
                  style={{ borderTop: "1px solid rgba(57,214,208,0.09)" }}
                >
                  <input
                    ref={inputRef}
                    type="text"
                    data-ocid="chat.message_input"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Type a message..."
                    className="sc-input flex-1 px-4 py-3 text-sm"
                  />
                  <button
                    type="button"
                    data-ocid="chat.send_button"
                    onClick={handleSend}
                    disabled={isSending || !newMessage.trim()}
                    className="btn-teal px-5 py-3 flex items-center gap-2 text-sm disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" /> Send
                  </button>
                </div>
              </div>

              {/* Side panel */}
              <div
                className="flex flex-col gap-4 overflow-y-auto"
                style={{ maxHeight: "calc(100vh - 200px)" }}
              >
                {/* Drawing */}
                <div
                  className="rounded-2xl p-5"
                  style={{
                    background: "rgba(8,18,28,0.80)",
                    border: "1px solid rgba(57,214,208,0.12)",
                  }}
                >
                  <h3
                    className="font-semibold mb-4 flex items-center gap-2 text-sm"
                    style={{ color: "oklch(0.78 0.10 190)" }}
                  >
                    <span>🎨</span> Drawing Board
                  </h3>
                  <DrawingCanvas />
                </div>

                {/* Games */}
                <div
                  className="rounded-2xl p-5 space-y-4"
                  style={{
                    background: "rgba(8,18,28,0.80)",
                    border: "1px solid rgba(57,214,208,0.12)",
                  }}
                >
                  <h3
                    className="font-semibold mb-1 flex items-center gap-2 text-sm"
                    style={{ color: "oklch(0.78 0.10 190)" }}
                  >
                    <span>🎮</span> Fun Games
                  </h3>
                  <GuessNumberGame />
                  <RockPaperScissors />
                  <WordScrambleGame />
                  <EmojiQuizGame />
                  <CoinFlipGame />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
