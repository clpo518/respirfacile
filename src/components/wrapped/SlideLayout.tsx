import { motion } from "framer-motion";
import React from "react";

interface SlideLayoutProps {
  children: React.ReactNode;
  gradient?: string;
}

const slideVariants = {
  enter: { opacity: 0, y: 40 },
  center: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
  exit: { opacity: 0, y: -40, transition: { duration: 0.3 } },
};

export default function SlideLayout({ children, gradient = "from-[#0f172a] via-[#1e293b] to-[#0f172a]" }: SlideLayoutProps) {
  return (
    <motion.div
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className={`min-h-[100dvh] w-full flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-br ${gradient} text-white relative overflow-hidden`}
    >
      {/* Subtle decorative circles */}
      <div className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-15%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-teal-500/8 blur-3xl pointer-events-none" />
      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center text-center gap-6">
        {children}
      </div>
    </motion.div>
  );
}
