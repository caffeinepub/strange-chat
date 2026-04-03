# Strange Chat — Voice Call Feature

## Current State
- ChatRoomPage has voice/video call buttons (UI only, no real call logic)
- StrangerPage has voice/video call buttons (UI only, no real call logic)
- No signaling or peer-to-peer logic exists
- Both rooms are single-tab simulations (no real multi-user backend)

## Requested Changes (Diff)

### Add
- WebRTC-based peer-to-peer voice call flow in ChatRoomPage
- Caller side: pressing Voice Call button sends a "calling" signal and shows an outgoing call UI (ringing animation, Cancel button)
- Callee side: incoming call notification overlay with Accept (green) and Decline (red) buttons
- On accept: both users connect via WebRTC getUserMedia audio, live call UI shown (mute button, end call button, call timer)
- On decline/cancel/end: call cleanly terminated, UI resets
- Use BroadcastChannel API to simulate signaling between two tabs of the same room (same room code = same channel)
- Same flow added to StrangerPage for stranger calls
- Mute/unmute toggle during active call
- Call duration timer displayed during active call

### Modify
- ChatRoomPage: replace placeholder voice call button with functional call trigger
- StrangerPage: replace placeholder voice call button with functional call trigger

### Remove
- Nothing removed

## Implementation Plan
1. Create a `useVoiceCall` custom hook that manages:
   - BroadcastChannel signaling (offer, answer, ice-candidate, call-end, call-decline)
   - WebRTC RTCPeerConnection setup
   - getUserMedia for microphone access
   - States: idle | calling | incoming | active
2. Integrate `useVoiceCall` into ChatRoomPage
3. Integrate `useVoiceCall` into StrangerPage
4. Add IncomingCallOverlay component (shown when state=incoming)
5. Add ActiveCallBar component (shown when state=active, with mute + end call + timer)
6. Add OutgoingCallOverlay component (shown when state=calling)
