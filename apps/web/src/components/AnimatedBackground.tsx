/**
 * Background: one flat --blue-900 fill plus large single-color blurred circles
 * that drift slowly. No color ramps anywhere - just flat fills + blur.
 */
export function AnimatedBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[var(--blue-900)]">
      <div className="animate-drift-a absolute -left-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-[var(--pink-500)] opacity-25 blur-3xl" />
      <div className="animate-drift-b absolute -right-52 top-1/4 h-[30rem] w-[30rem] rounded-full bg-[var(--red-500)] opacity-20 blur-3xl" />
      <div className="animate-drift-c absolute -bottom-56 left-1/3 h-[32rem] w-[32rem] rounded-full bg-[var(--blue-500)] opacity-25 blur-3xl" />
    </div>
  );
}
