"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function FloatingShapes() {
  const [shapes, setShapes] = useState<Array<{
    id: number;
    size: number;
    x: number;
    y: number;
    duration: number;
    delay: number;
  }>>([]);

  useEffect(() => {
    // Generate shapes only on client - further reduced for performance
    setShapes(Array.from({ length: 3 }, (_, i) => ({
      id: i,
      size: Math.random() * 60 + 30, // Even smaller
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 12 + 8, // Faster
      delay: Math.random() * 0.5,
    })));
  }, []);

  if (shapes.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {shapes.map((shape) => (
        <motion.div
          key={shape.id}
          className="absolute rounded-full bg-gradient-to-br from-primary/10 to-primary/5 blur-2xl"
          style={{
            width: `${shape.size}px`,
            height: `${shape.size}px`,
            left: `${shape.x}%`,
            top: `${shape.y}%`,
          }}
          animate={{
            x: [0, 30, -30, 0],
            y: [0, 20, -20, 0],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{
            duration: shape.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: shape.delay,
            type: "tween", // Faster than spring
          }}
        />
      ))}
    </div>
  );
}

