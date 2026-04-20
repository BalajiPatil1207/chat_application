import { useEffect, useRef } from "react";
import { Mic, MicOff, PhoneOff, Video, VideoOff } from "lucide-react";
import { useCallStore } from "../store/useCallStore";
import { useChatStore } from "../store/useChatStore";

function CallOverlay() {
  const { 
    localStream, 
    remoteStream, 
    callStatus, 
    endCall, 
    callType,
    toggleMute,
    toggleVideo,
    isMuted,
    isVideoOff
  } = useCallStore();
  
  const { selectedUser } = useChatStore();
  
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  if (callStatus === "idle" || callStatus === "receiving") return null;

  return (
    <div className="fixed inset-0 z-[110] bg-[#0b141a] flex flex-col items-center justify-center">
      {/* Background - Remote Video or Avatar */}
      <div className="absolute inset-0 w-full h-full bg-slate-900 overflow-hidden">
        {callType === "video" && remoteStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#111b21]">
            <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-white/5 shadow-2xl">
                <img src={selectedUser?.profilePic || "/avatar.png"} alt="User" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-3xl font-bold text-white">{selectedUser?.fullName}</h2>
            <p className="text-slate-400 mt-2 text-lg animate-pulse">
                {callStatus === "ringing" ? "Ringing..." : "Active Call"}
            </p>
          </div>
        )}
      </div>

      {/* Local Video - PIP */}
      {callType === "video" && localStream && !isVideoOff && (
        <div className="absolute top-8 right-8 w-32 md:w-48 aspect-[9/16] bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/10 z-[120]">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover mirror"
          />
        </div>
      )}

      {/* Call Controls Overlay */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-6 px-10 py-6 bg-black/40 backdrop-blur-md rounded-full border border-white/10 z-[130]">
        
        {/* Toggle Audio */}
        <button 
          onClick={toggleMute}
          className={`p-4 rounded-full transition-colors ${isMuted ? "bg-red-500 text-white" : "bg-white/10 hover:bg-white/20 text-white"}`}
        >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>

        {/* End Call */}
        <button 
           onClick={endCall}
           className="p-5 rounded-full bg-red-500 hover:bg-red-600 text-white transition-transform hover:scale-110 active:scale-95 shadow-xl shadow-red-500/20"
        >
            <PhoneOff className="w-8 h-8 fill-current" />
        </button>

        {/* Toggle Video (if video call) */}
        {callType === "video" && (
            <button 
              onClick={toggleVideo}
              className={`p-4 rounded-full transition-colors ${isVideoOff ? "bg-red-500 text-white" : "bg-white/10 hover:bg-white/20 text-white"}`}
            >
                {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
            </button>
        )}
      </div>

      <style>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
}

export default CallOverlay;
