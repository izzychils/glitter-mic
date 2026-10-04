import { Route, Routes } from "react-router-dom";
import { AnimatedBackground } from "./components/AnimatedBackground";
import { DesignSystem } from "./pages/DesignSystem";
import { Landing } from "./pages/Landing";
import { NotFound } from "./pages/NotFound";

export default function App() {
  return (
    <>
      <AnimatedBackground />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/design" element={<DesignSystem />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
