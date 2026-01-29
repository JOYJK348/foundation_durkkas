"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface DoubtFabProps {
  unresolvedCount?: number;
  onRaiseDoubt?: () => void;
}

export function DoubtFab({ unresolvedCount = 0, onRaiseDoubt }: DoubtFabProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Don't show unresolved tickets list if count is 0
  const hasUnresolved = unresolvedCount > 0;

  return (
    <>
      {/* Floating Action Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-20 right-4 sm:right-6 z-40"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            setIsExpanded(!isExpanded);
            if (!isExpanded && onRaiseDoubt) {
              onRaiseDoubt();
            }
          }}
          className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center ${
            unresolvedCount > 0
              ? "bg-red-600"
              : "bg-blue-600"
          } text-white hover:opacity-90`}
        >
          <AnimatePresence mode="wait">
            {isExpanded ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                <X className="h-6 w-6" />
              </motion.div>
            ) : (
              <motion.div
                key="plus"
                animate={{
                  scale: hasUnresolved ? [1, 1.2, 1] : 1,
                }}
                transition={{
                  duration: 1.5,
                  repeat: hasUnresolved ? Infinity : 0,
                }}
              >
                {hasUnresolved ? (
                  <MessageSquare className="h-6 w-6" />
                ) : (
                  <Plus className="h-6 w-6" />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Badge */}
        {hasUnresolved && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center border-2 border-white"
          >
            {unresolvedCount}
          </motion.div>
        )}
      </motion.div>

      {/* Unresolved Tickets Mini List - Hidden to avoid UI/UX disturbance */}
    </>
  );
}

