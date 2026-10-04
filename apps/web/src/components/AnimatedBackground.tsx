/**
 * Background: Navy blue base with subtle animated stars/particles
 */
export function AnimatedBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[var(--navy)]">
      {/* Subtle glow effects */}
      <div className="animate-pulse-glow absolute -left-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-[var(--blood-pink)] opacity-10 blur-[120px]" />
      <div className="animate-pulse-glow absolute -right-40 top-1/3 h-[35rem] w-[35rem] rounded-full bg-[var(--blood-red)] opacity-10 blur-[120px] animation-delay-2000" />
      
      {/* Floating particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-white opacity-20 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${15 + Math.random() * 15}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
