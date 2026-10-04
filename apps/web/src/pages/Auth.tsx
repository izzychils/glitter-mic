import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "../components/ui/Button";
import { useToast } from "../components/ui/Toast";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { storeSessionToken } from "../lib/session";

interface AuthPageProps {
  onAuthSuccess: () => void;
}

export function Auth({ onAuthSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");

  // Error state
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    username?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    // Email validation
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    // Password validation
    if (!password) {
      newErrors.password = "Password is required";
    } else if (mode === "signup" && password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    // Username validation (only for signup)
    if (mode === "signup") {
      if (!username) {
        newErrors.username = "Username is required";
      } else if (username.length < 3) {
        newErrors.username = "Username must be at least 3 characters";
      } else if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        newErrors.username = "Username can only contain letters, numbers, _ and -";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const body =
        mode === "login"
          ? { email, password }
          : { email, password, username, displayName: displayName || undefined };

      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:4000"}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.details) {
          // Field-specific errors from backend
          setErrors(data.details);
        }
        throw new Error(data.message || data.error || "Authentication failed");
      }

      // Store session ID for browsers that block third-party cookies
      if (data.sessionId) {
        storeSessionToken(data.sessionId);
      }

      toast(mode === "login" ? "Welcome back!" : "Account created successfully!", "success");
      onAuthSuccess();
    } catch (error: any) {
      toast(error.message || "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === "login" ? "signup" : "login");
    setPassword("");
    setErrors({});
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-4 inline-flex items-center justify-center"
          >
            <div className="relative">
              <Sparkles className="h-12 w-12 text-blood-pink" />
              <motion.div
                className="absolute inset-0 blur-xl"
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Sparkles className="h-12 w-12 text-blood-pink" />
              </motion.div>
            </div>
          </motion.div>

          <h1 className="mb-2 text-4xl font-extrabold text-white md:text-5xl">
            Glitter Mic
          </h1>
          <p className="text-lg text-white/70">
            {mode === "login" ? "Welcome back, superstar" : "Start your journey"}
          </p>
        </div>

        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-white/10 bg-navy-lighter/90 p-8 shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {mode === "signup" && (
                <>
                  <motion.div
                    key="username"
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="relative">
                      <User className="absolute left-4 top-4 h-5 w-5 text-white/50" />
                      <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => {
                          setUsername(e.target.value);
                          setErrors({ ...errors, username: undefined });
                        }}
                        className={`h-14 w-full rounded-xl border bg-navy-dark pl-12 pr-4 text-white placeholder:text-white/40 transition-all focus:outline-none focus:ring-2 ${
                          errors.username
                            ? "border-blood-red focus:border-blood-red focus:ring-blood-red/50"
                            : "border-white/20 focus:border-blood-pink focus:ring-blood-pink/50"
                        }`}
                      />
                    </div>
                    {errors.username && (
                      <p className="mt-2 flex items-center gap-1.5 text-sm text-blood-red">
                        {errors.username}
                      </p>
                    )}
                  </motion.div>

                  <motion.div
                    key="displayName"
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <div className="relative">
                      <User className="absolute left-4 top-4 h-5 w-5 text-white/50" />
                      <input
                        type="text"
                        placeholder="Display Name (optional)"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="h-14 w-full rounded-xl border border-white/20 bg-navy-dark pl-12 pr-4 text-white placeholder:text-white/40 transition-all focus:border-blood-pink focus:outline-none focus:ring-2 focus:ring-blood-pink/50"
                      />
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            <div>
              <div className="relative">
                <Mail className="absolute left-4 top-4 h-5 w-5 text-white/50" />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors({ ...errors, email: undefined });
                  }}
                  className={`h-14 w-full rounded-xl border bg-navy-dark pl-12 pr-4 text-white placeholder:text-white/40 transition-all focus:outline-none focus:ring-2 ${
                    errors.email
                      ? "border-blood-red focus:border-blood-red focus:ring-blood-red/50"
                      : "border-white/20 focus:border-blood-pink focus:ring-blood-pink/50"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-2 flex items-center gap-1.5 text-sm text-blood-red">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <div className="relative">
                <Lock className="absolute left-4 top-4 h-5 w-5 text-white/50" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors({ ...errors, password: undefined });
                  }}
                  className={`h-14 w-full rounded-xl border bg-navy-dark pl-12 pr-12 text-white placeholder:text-white/40 transition-all focus:outline-none focus:ring-2 ${
                    errors.password
                      ? "border-blood-red focus:border-blood-red focus:ring-blood-red/50"
                      : "border-white/20 focus:border-blood-pink focus:ring-blood-pink/50"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 text-white/50 transition-colors hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 flex items-center gap-1.5 text-sm text-blood-red">
                  {errors.password}
                </p>
              )}
            </div>

            {loading ? (
              <div className="py-4">
                <LoadingSpinner
                  message={mode === "login" ? "Signing you in..." : "Creating your account..."}
                  size="sm"
                />
              </div>
            ) : (
              <Button type="submit" fullWidth size="lg" className="mt-6" leftIcon={ArrowRight}>
                {mode === "login" ? "Sign In" : "Create Account"}
              </Button>
            )}
          </form>

          {/* Toggle mode */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-white/60 transition-colors hover:text-blood-pink"
              disabled={loading}
            >
              {mode === "login" ? (
                <>
                  Don't have an account?{" "}
                  <span className="font-semibold text-blood-pink">Sign up</span>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <span className="font-semibold text-blood-pink">Sign in</span>
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-center text-xs text-white/40"
        >
          By continuing, you agree to our Terms of Service and Privacy Policy
        </motion.p>
      </motion.div>
    </div>
  );
}
