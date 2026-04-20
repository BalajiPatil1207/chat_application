import { Phone, PhoneOff, Video } from "lucide-react";
import { useCallStore } from "../store/useCallStore";

function IncomingCallModal() {
  const { incomingCall, acceptCall, endCall, callType } = useCallStore();

  if (!incomingCall) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#202c33] p-8 rounded-2xl shadow-2xl w-full max-w-sm border border-white/10 flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
        
        {/* Avatar Area */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-cyan-500/30 animate-pulse">
            <img 
               src={incomingCall.fromInfo?.profilePic || "/avatar.png"} 
               alt="Caller" 
               className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-cyan-500 p-2 rounded-full shadow-lg">
            {callType === "video" ? <Video className="w-5 h-5 text-white" /> : <Phone className="w-5 h-5 text-white" />}
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">{incomingCall.fromInfo?.fullName}</h2>
        <p className="text-slate-400 mb-8 flex items-center">
          Incoming {callType} call...
        </p>

        <div className="flex gap-4 w-full">
          {/* Decline Button */}
          <button
            onClick={endCall}
            className="flex-1 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            <PhoneOff className="w-5 h-5 group-hover:animate-bounce" />
            Decline
          </button>

          {/* Accept Button */}
          <button
            onClick={acceptCall}
            className="flex-1 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            {callType === "video" ? (
                <Video className="w-5 h-5 group-hover:animate-bounce" />
            ) : (
                <Phone className="w-5 h-5 group-hover:animate-bounce" />
            )}
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

export default IncomingCallModal;
