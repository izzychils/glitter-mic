import { motion } from "framer-motion";

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Beautiful loading spinner inspired by Stardust app
 * Features smooth pulsing animation and optional message
 */
export function LoadingSpinner({ message, size = "md" }: LoadingSpinnerProps) {
  const sizes = {
    sm: "h-8 w-8",
    md: "h-16 w-16",
    lg: "h-24 w-24",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-12">
      <div className="relative">
        {/* Outer glow ring */}
        <motion.div
          className={`${sizes[size]} rounded-full bg-blood-pink opacity-20 blur-xl`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Middle ring */}
        <motion.div
          className={`absolute inset-0 ${sizes[size]} rounded-full border-4 border-blood-pink/30`}
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Inner spinning circle */}
        <motion.div
          className={`absolute inset-0 ${sizes[size]} rounded-full border-4 border-transparent border-t-blood-pink`}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Center dot */}
        <motion.div
          className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blood-pink"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [1, 0.6, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {message && (
        <motion.p
          className="text-center text-sm text-white/70"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {message}
        </motion.p>
      )}
    </div>
  );
}

/**
 * Full-page loading screen with animated background
 */
export function LoadingScreen({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy">
      <div className="text-center">
        {/* App logo/title with glow effect */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-extrabold tracking-tight text-white md:text-6xl">
            <span className="relative">
              Glitter Mic
              <motion.span
                className="absolute -inset-2 -z-10 rounded-lg bg-blood-pink/20 blur-xl"
                animate={{
                  opacity: [0.2, 0.4, 0.2],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </span>
          </h1>
        </motion.div>

        <LoadingSpinner message={message} size="lg" />
      </div>
    </div>
  );
}
