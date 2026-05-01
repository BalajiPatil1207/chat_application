import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import { MessageCircleIcon, LockIcon, MailIcon, UserIcon, LoaderIcon } from "lucide-react";
import { Link } from "react-router-dom";

function SignUpPage() {
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "" });
  const { signup, isSigningUp } = useAuthStore();

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await signup(formData);
    if (success) navigate("/login");
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 bg-[var(--bg-main)] transition-colors duration-500 overflow-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 -left-20 size-96 bg-[var(--accent-color)]/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-1/4 -right-20 size-96 bg-[var(--accent-color)]/10 blur-[120px] rounded-full" />

      <div className="relative w-full max-w-5xl glass-card rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-700">
        <div className="w-full flex flex-col md:flex-row min-h-[600px] md:h-[700px]">
          {/* FORM COLUMN - LEFT SIDE */}
          <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center border-b md:border-b-0 md:border-r border-[var(--border-color)] relative z-10">
            <div className="w-full max-w-md mx-auto">
              {/* HEADING TEXT */}
              <div className="text-center md:text-left mb-8">
                <div className="size-16 bg-[var(--accent-color)]/10 rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0 shadow-inner">
                  <MessageCircleIcon className="size-8 text-[var(--accent-color)]" />
                </div>
                <h2 className="text-3xl font-extrabold text-[var(--text-main)] mb-2 tracking-tight">Create Account</h2>
                <p className="text-[var(--text-muted)] font-medium leading-relaxed">Join our secure messaging community today</p>
              </div>

              {/* FORM */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* FULL NAME */}
                <div>
                  <label className="auth-input-label">Full Name</label>
                  <div className="relative group">
                    <UserIcon className="auth-input-icon group-focus-within:text-[var(--accent-color)] transition-colors" />

                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="input"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                {/* EMAIL INPUT */}
                <div>
                  <label className="auth-input-label">Email Address</label>
                  <div className="relative group">
                    <MailIcon className="auth-input-icon group-focus-within:text-[var(--accent-color)] transition-colors" />

                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                {/* PASSWORD INPUT */}
                <div>
                  <label className="auth-input-label">Password</label>
                  <div className="relative group">
                    <LockIcon className="auth-input-icon group-focus-within:text-[var(--accent-color)] transition-colors" />

                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="input"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <button className="auth-btn group relative overflow-hidden mt-2" type="submit" disabled={isSigningUp}>
                  <div className="relative z-10 flex items-center justify-center gap-2">
                    {isSigningUp ? (
                      <LoaderIcon className="size-5 animate-spin" />
                    ) : (
                      <>
                        <span>Get Started</span>
                        <div className="size-1.5 bg-white/30 rounded-full animate-pulse transition-all group-hover:scale-150" />
                      </>
                    )}
                  </div>
                </button>
              </form>

              <div className="mt-8 text-center text-sm">
                <p className="text-[var(--text-muted)] mb-4">Already have an account?</p>
                <Link to="/login" className="auth-link font-bold">
                  Sign in here
                </Link>
              </div>
            </div>
          </div>

          {/* FORM ILLUSTRATION - RIGHT SIDE */}
          <div className="hidden md:w-1/2 md:flex flex-col items-center justify-center p-12 bg-[var(--bg-elevated)] relative overflow-hidden">
            <div className="relative z-10 text-center">
              <div className="relative inline-block mb-10">
                <div className="absolute inset-0 bg-[var(--accent-color)]/20 blur-3xl rounded-full" />
                <img
                  src="/signup.png"
                  alt="Signup Illustration"
                  className="w-full max-w-[340px] h-auto object-contain relative z-10 animate-pulse duration-[4000ms]"
                />
              </div>
              
              <h3 className="text-2xl font-bold text-[var(--text-main)] mb-4 tracking-tight">Your Privacy, Guaranteed</h3>
              <p className="text-[var(--text-muted)] max-w-sm mx-auto mb-8 font-medium">Join thousands of users who trust us for their daily professional communication.</p>

              <div className="flex flex-wrap justify-center gap-3">
                <span className="auth-badge">Encrypted</span>
                <span className="auth-badge">Real-time</span>
                <span className="auth-badge">No Limits</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default SignUpPage;
