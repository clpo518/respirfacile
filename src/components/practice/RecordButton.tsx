import { Mic, Square } from "lucide-react";
import { motion } from "framer-motion";

interface RecordButtonProps {
  isRecording: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const RecordButton = ({ isRecording, onClick, disabled }: RecordButtonProps) => {
  return (
    <div className="relative">
      {/* Animated rings when recording */}
      {isRecording && (
        <>
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/20"
            initial={{ scale: 1 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/20"
            initial={{ scale: 1 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
          />
        </>
      )}
      
      <motion.button
        onClick={onClick}
        disabled={disabled}
        className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-colors ${
          isRecording 
            ? "bg-speed-critical text-white" 
            : "bg-primary text-primary-foreground hover:bg-primary/90"
        } disabled:opacity-50 disabled:cursor-not-allowed shadow-lg`}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
      >
        {isRecording ? (
          <Square className="w-8 h-8" fill="currentColor" />
        ) : (
          <Mic className="w-8 h-8" />
        )}
      </motion.button>
    </div>
  );
};

export default RecordButton;
