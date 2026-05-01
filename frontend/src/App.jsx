import { Navigate, Route, Routes } from "react-router-dom";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";
import PageLoader from "./components/PageLoader";
import IncomingCallModal from "./components/IncomingCallModal";
import CallOverlay from "./components/CallOverlay";
import { useCallStore } from "./store/useCallStore";
import { useChatStore } from "./store/useChatStore";

import { Toaster } from "react-hot-toast";

function App() {
  const { checkAuth, isCheckingAuth, authUser, socket } = useAuthStore();
  const { 
    handleIncomingCall, 
    handleCallAccepted, 
    handleIceCandidate, 
    handleCallEnded 
  } = useCallStore();

  const { activeTab, theme, setTheme } = useChatStore();

  useEffect(() => {
    checkAuth();
    // Initialize theme
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [checkAuth, theme]);

  useEffect(() => {
    if (!socket) return;

    socket.on("incoming:call", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("ice:candidate", handleIceCandidate);
    socket.on("call:ended", handleCallEnded);

    return () => {
      socket.off("incoming:call", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("ice:candidate", handleIceCandidate);
      socket.off("call:ended", handleCallEnded);
    };
  }, [socket, handleIncomingCall, handleCallAccepted, handleIceCandidate, handleCallEnded]);

  if (isCheckingAuth) return <PageLoader />;

  return (
    <div className="min-h-screen bg-slate-900 relative flex items-center justify-center p-0 md:p-4 overflow-auto md:overflow-hidden">
      {/* Main app content */}
      <IncomingCallModal />
      <CallOverlay />

      <Routes>
        <Route path="/" element={authUser ? <ChatPage /> : <Navigate to={"/signup"} />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to={"/"} />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to={"/"} />} />
      </Routes>

      <Toaster />
    </div>
  );
}
export default App;
