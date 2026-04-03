import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export type VideoCallState = "idle" | "calling" | "incoming" | "active";

type VideoSignal =
  | { type: "video-offer"; sdp: string; from: string }
  | { type: "video-answer"; sdp: string; from: string }
  | { type: "video-ice"; candidate: RTCIceCandidateInit; from: string }
  | { type: "video-decline"; from: string }
  | { type: "video-end"; from: string };

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export function useVideoCall(channelId: string) {
  const [videoCallState, setVideoCallState] = useState<VideoCallState>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const channelRef = useRef<BroadcastChannel | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  // Callbacks for attaching streams to video elements
  const onLocalStreamRef = useRef<((stream: MediaStream) => void) | null>(null);
  const onRemoteStreamRef = useRef<((stream: MediaStream) => void) | null>(
    null,
  );
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pendingOfferRef = useRef<RTCSessionDescriptionInit | null>(null);
  const myIdRef = useRef(`vuser_${Math.random().toString(36).slice(2, 9)}`);

  const broadcast = useCallback((msg: VideoSignal) => {
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
    remoteStreamRef.current = null;
    stopTimer();
  }, [stopTimer]);

  const createPeer = useCallback(() => {
    closePeer();
    const pc = new RTCPeerConnection(RTC_CONFIG);

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        broadcast({
          type: "video-ice",
          candidate: e.candidate.toJSON(),
          from: myIdRef.current,
        });
      }
    };

    pc.ontrack = (e) => {
      const stream = e.streams[0];
      remoteStreamRef.current = stream;
      if (onRemoteStreamRef.current) {
        onRemoteStreamRef.current(stream);
      }
    };

    peerRef.current = pc;
    return pc;
  }, [broadcast, closePeer]);

  const getLocalStream = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    localStreamRef.current = stream;
    if (onLocalStreamRef.current) {
      onLocalStreamRef.current(stream);
    }
    return stream;
  }, []);

  // Register callbacks for stream delivery
  const setLocalStreamCallback = useCallback(
    (cb: (stream: MediaStream) => void) => {
      onLocalStreamRef.current = cb;
      // If stream already exists, deliver it immediately
      if (localStreamRef.current) cb(localStreamRef.current);
    },
    [],
  );

  const setRemoteStreamCallback = useCallback(
    (cb: (stream: MediaStream) => void) => {
      onRemoteStreamRef.current = cb;
      if (remoteStreamRef.current) cb(remoteStreamRef.current);
    },
    [],
  );

  const startVideoCall = useCallback(async () => {
    if (videoCallState !== "idle") return;
    try {
      const stream = await getLocalStream();
      const pc = createPeer();
      for (const track of stream.getTracks()) pc.addTrack(track, stream);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      setVideoCallState("calling");
      broadcast({
        type: "video-offer",
        sdp: offer.sdp!,
        from: myIdRef.current,
      });
    } catch (err) {
      console.error(err);
      toast.error("Camera/microphone permission required for video calls");
      closePeer();
    }
  }, [videoCallState, getLocalStream, createPeer, broadcast, closePeer]);

  const acceptVideoCall = useCallback(async () => {
    if (videoCallState !== "incoming" || !pendingOfferRef.current) return;
    try {
      const stream = await getLocalStream();
      const pc = createPeer();
      for (const track of stream.getTracks()) pc.addTrack(track, stream);
      await pc.setRemoteDescription(
        new RTCSessionDescription(pendingOfferRef.current),
      );
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      broadcast({
        type: "video-answer",
        sdp: answer.sdp!,
        from: myIdRef.current,
      });
      setVideoCallState("active");
      startTimer();
      pendingOfferRef.current = null;
    } catch (err) {
      console.error(err);
      toast.error("Failed to accept video call — camera permission required");
      closePeer();
      setVideoCallState("idle");
    }
  }, [
    videoCallState,
    getLocalStream,
    createPeer,
    broadcast,
    closePeer,
    startTimer,
  ]);

  const declineVideoCall = useCallback(() => {
    broadcast({ type: "video-decline", from: myIdRef.current });
    pendingOfferRef.current = null;
    closePeer();
    setVideoCallState("idle");
  }, [broadcast, closePeer]);

  const endVideoCall = useCallback(() => {
    broadcast({ type: "video-end", from: myIdRef.current });
    closePeer();
    setVideoCallState("idle");
    setIsMuted(false);
    setIsCamOff(false);
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

  const toggleCamera = useCallback(() => {
    if (!localStreamRef.current) return;
    const next = !isCamOff;
    for (const t of localStreamRef.current.getVideoTracks()) {
      t.enabled = !next;
    }
    setIsCamOff(next);
  }, [isCamOff]);

  // Signal handler
  useEffect(() => {
    const ch = new BroadcastChannel(`strangechat_videocall_${channelId}`);
    channelRef.current = ch;

    ch.onmessage = async (event: MessageEvent<VideoSignal>) => {
      const msg = event.data;
      if (msg.from === myIdRef.current) return;

      if (msg.type === "video-offer") {
        pendingOfferRef.current = { type: "offer", sdp: msg.sdp };
        setVideoCallState("incoming");
      } else if (msg.type === "video-answer") {
        if (peerRef.current && peerRef.current.signalingState !== "stable") {
          try {
            await peerRef.current.setRemoteDescription(
              new RTCSessionDescription({ type: "answer", sdp: msg.sdp }),
            );
            setVideoCallState("active");
            startTimer();
          } catch (err) {
            console.error("Failed to set remote video answer:", err);
          }
        }
      } else if (msg.type === "video-ice") {
        if (peerRef.current) {
          try {
            await peerRef.current.addIceCandidate(
              new RTCIceCandidate(msg.candidate),
            );
          } catch (err) {
            console.error("Video ICE candidate error:", err);
          }
        }
      } else if (msg.type === "video-decline") {
        closePeer();
        setVideoCallState("idle");
        toast.info("Video call was declined");
      } else if (msg.type === "video-end") {
        closePeer();
        setVideoCallState("idle");
        setIsMuted(false);
        setIsCamOff(false);
        setCallDuration(0);
        toast.info("Video call ended");
      }
    };

    return () => {
      ch.close();
      channelRef.current = null;
    };
  }, [channelId, closePeer, startTimer]);

  useEffect(() => {
    return () => {
      closePeer();
    };
  }, [closePeer]);

  const fmtDuration = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return {
    videoCallState,
    isMuted,
    isCamOff,
    callDuration,
    fmtDuration,
    startVideoCall,
    acceptVideoCall,
    declineVideoCall,
    endVideoCall,
    toggleMute,
    toggleCamera,
    setLocalStreamCallback,
    setRemoteStreamCallback,
  };
}
