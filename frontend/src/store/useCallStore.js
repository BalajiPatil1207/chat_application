import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import toast from "react-hot-toast";

export const useCallStore = create((set, get) => ({
  localStream: null,
  remoteStream: null,
  isCalling: false,
  callStatus: "idle", // idle, ringing, active, receiving
  incomingCall: null,
  peer: null,
  callType: null, // 'audio' or 'video'
  isMuted: false,
  isVideoOff: false,

  toggleMute: () => {
    const { localStream, isMuted } = get();
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = isMuted;
      });
      set({ isMuted: !isMuted });
    }
  },

  toggleVideo: () => {
    const { localStream, isVideoOff } = get();
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = isVideoOff;
      });
      set({ isVideoOff: !isVideoOff });
    }
  },

  setLocalStream: (stream) => set({ localStream: stream }),
  setRemoteStream: (stream) => set({ remoteStream: stream }),
  
  handleCallUser: async (to, type = "video") => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === "video",
      });

      set({ 
        localStream: stream, 
        isCalling: true, 
        callStatus: "ringing", 
        callType: type 
      });

      const peer = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });

      stream.getTracks().forEach((track) => peer.addTrack(track, stream));

      peer.ontrack = (event) => {
        set({ remoteStream: event.streams[0] });
      };

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice:candidate", { to, candidate: event.candidate });
        }
      };

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      socket.emit("call:user", { to, offer, type });

      set({ peer });
    } catch (error) {
      console.error("Failed to start call:", error);
      toast.error("Could not access camera/microphone");
    }
  },

  handleIncomingCall: (data) => {
    set({ 
      incomingCall: data, 
      callStatus: "receiving", 
      callType: data.type 
    });
  },

  acceptCall: async () => {
    const { incomingCall } = get();
    const socket = useAuthStore.getState().socket;
    if (!incomingCall || !socket) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: incomingCall.type === "video",
      });

      set({ 
        localStream: stream, 
        callStatus: "active", 
        incomingCall: null 
      });

      const peer = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });

      stream.getTracks().forEach((track) => peer.addTrack(track, stream));

      peer.ontrack = (event) => {
        set({ remoteStream: event.streams[0] });
      };

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice:candidate", { 
            to: incomingCall.from, 
            candidate: event.candidate 
          });
        }
      };

      await peer.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
      const ans = await peer.createAnswer();
      await peer.setLocalDescription(ans);

      socket.emit("call:accepted", { to: incomingCall.from, ans });

      set({ peer });
    } catch (error) {
      console.error("Failed to accept call:", error);
      toast.error("Failed to connect call");
      get().endCall();
    }
  },

  handleCallAccepted: async ({ ans }) => {
    const { peer } = get();
    if (peer) {
      await peer.setRemoteDescription(new RTCSessionDescription(ans));
      set({ callStatus: "active" });
    }
  },

  handleIceCandidate: async ({ candidate }) => {
    const { peer } = get();
    if (peer) {
      try {
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error("Error adding ice candidate", e);
      }
    }
  },

  endCall: () => {
    const { localStream, peer, incomingCall, isCalling } = get();
    const socket = useAuthStore.getState().socket;
    
    // Notify other party if in a call
    const otherPartyId = incomingCall?.from || (isCalling && useAuthStore.getState().selectedUser?._id);
    if (socket && otherPartyId) {
        socket.emit("call:ended", { to: otherPartyId });
    }

    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }

    if (peer) {
      peer.close();
    }

    set({
      localStream: null,
      remoteStream: null,
      isCalling: false,
      callStatus: "idle",
      incomingCall: null,
      peer: null,
      callType: null
    });
  },

  handleCallEnded: () => {
    const { localStream, peer } = get();
    if (localStream) localStream.getTracks().forEach((track) => track.stop());
    if (peer) peer.close();

    set({
      localStream: null,
      remoteStream: null,
      isCalling: false,
      callStatus: "idle",
      incomingCall: null,
      peer: null,
      callType: null
    });

    toast("Call ended", { icon: "📞" });
  },
}));
