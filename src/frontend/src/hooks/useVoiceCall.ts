import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export type CallState = "idle" | "calling" | "incoming" | "active";

type SignalMessage =
  | { type: "offer"; sdp: string; from: string }
  | { type: "answer"; sdp: string; from: string }
  | { type: "ice"; candidate: RTCIceCandidateInit; from: string }
  | { type: "decline"; from: string }
  | { type: "end"; from: string };

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export function useVoiceCall(channelId: string) {
  const [callState, setCallState] = useState<CallState>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const channelRef = useRef<BroadcastChannel | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pendingOfferRef = useRef<RTCSessionDescriptionInit | null>(null);
  const myIdRef = useRef(`user_${Math.random().toString(36).slice(2, 9)}`);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const broadcast = useCallback((msg: SignalMessage) => {
    channelRef.current?.postMessage(msg);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    setCallDuration(0);
    timerRef.current = setInterval(() => setCallDuration((s) => s + 1), 1000);
  }, [stopTimer]);

  const closePeer = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.onicecandidate = null;
      peerRef.current.ontrack = null;
      peerRef.current.close();
      peerRef.current = null;
    }
    if (localStreamRef.current) {
      for (const t of localStreamRef.current.getTracks()) t.stop();
      localStreamRef.current = null;
    }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
      remoteAudioRef.current = null;
    }
    stopTimer();
  }, [stopTimer]);

  const createPeer = useCallback(() => {
    closePeer();
    const pc = new RTCPeerConnection(RTC_CONFIG);

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        broadcast({
          type: "ice",
          candidate: e.candidate.toJSON(),
          from: myIdRef.current,
        });
      }
    };

    pc.ontrack = (e) => {
      const audio = new Audio();
      audio.autoplay = true;
      audio.srcObject = e.streams[0];
      remoteAudioRef.current = audio;
    };

    peerRef.current = pc;
    return pc;
  }, [broadcast, closePeer]);

  const getLocalStream = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    localStreamRef.current = stream;
    return stream;
  }, []);

  // ── Public API ────────────────────────────────────────────────────────────────
  const startCall = useCallback(async () => {
    if (callState !== "idle") return;
    try {
      const stream = await getLocalStream();
      const pc = createPeer();
      for (const track of stream.getTracks()) {
        pc.addTrack(track, stream);
      }
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      setCallState("calling");
      broadcast({
        type: "offer",
        sdp: offer.sdp!,
        from: myIdRef.current,
      });
    } catch (err) {
      console.error(err);
      toast.error("Microphone permission required for voice calls");
      closePeer();
    }
  }, [callState, getLocalStream, createPeer, broadcast, closePeer]);

  const acceptCall = useCallback(async () => {
    if (callState !== "incoming" || !pendingOfferRef.current) return;
    try {
      const stream = await getLocalStream();
      const pc = createPeer();
      for (const track of stream.getTracks()) {
        pc.addTrack(track, stream);
      }
      await pc.setRemoteDescription(
        new RTCSessionDescription(pendingOfferRef.current),
      );
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      broadcast({
        type: "answer",
        sdp: answer.sdp!,
        from: myIdRef.current,
      });
      setCallState("active");
      startTimer();
      pendingOfferRef.current = null;
    } catch (err) {
      console.error(err);
      toast.error("Failed to accept call — mic permission required");
      closePeer();
      setCallState("idle");
    }
  }, [callState, getLocalStream, createPeer, broadcast, closePeer, startTimer]);

  const declineCall = useCallback(() => {
    broadcast({ type: "decline", from: myIdRef.current });
    pendingOfferRef.current = null;
    closePeer();
    setCallState("idle");
  }, [broadcast, closePeer]);

  const endCall = useCallback(() => {
    broadcast({ type: "end", from: myIdRef.current });
    closePeer();
    setCallState("idle");
    setIsMuted(false);
    setCallDuration(0);
  }, [broadcast, closePeer]);

  const toggleMute = useCallback(() => {
    if (!localStreamRef.current) return;
    const next = !isMuted;
    for (const t of localStreamRef.current.getAudioTracks()) {
      t.enabled = !next;
    }
    setIsMuted(next);
  }, [isMuted]);

  // ── Signal handler ────────────────────────────────────────────────────────────
  useEffect(() => {
    const ch = new BroadcastChannel(`strangechat_call_${channelId}`);
    channelRef.current = ch;

    ch.onmessage = async (event: MessageEvent<SignalMessage>) => {
      const msg = event.data;
      // ignore own messages
      if (msg.from === myIdRef.current) return;

      if (msg.type === "offer") {
        pendingOfferRef.current = { type: "offer", sdp: msg.sdp };
        setCallState("incoming");
      } else if (msg.type === "answer") {
        if (peerRef.current && peerRef.current.signalingState !== "stable") {
          try {
            await peerRef.current.setRemoteDescription(
              new RTCSessionDescription({ type: "answer", sdp: msg.sdp }),
            );
            setCallState("active");
            startTimer();
          } catch (err) {
            console.error("Failed to set remote answer:", err);
          }
        }
      } else if (msg.type === "ice") {
        if (peerRef.current) {
          try {
            await peerRef.current.addIceCandidate(
              new RTCIceCandidate(msg.candidate),
            );
          } catch (err) {
            console.error("ICE candidate error:", err);
          }
        }
      } else if (msg.type === "decline") {
        closePeer();
        setCallState("idle");
        toast.info("Call was declined");
      } else if (msg.type === "end") {
        closePeer();
        setCallState("idle");
        setIsMuted(false);
        setCallDuration(0);
        toast.info("Call ended");
      }
    };

    return () => {
      ch.close();
      channelRef.current = null;
    };
  }, [channelId, closePeer, startTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      closePeer();
    };
  }, [closePeer]);

  const fmtDuration = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return {
    callState,
    isMuted,
    callDuration,
    fmtDuration,
    startCall,
    acceptCall,
    declineCall,
    endCall,
    toggleMute,
  };
}
