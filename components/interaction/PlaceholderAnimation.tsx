"use client";

import { motion } from "framer-motion";

import { INTERACTIONS } from "@/lib/interactions/catalog";
import type { InteractionDef } from "@/types";

interface PlaceholderAnimationProps {
  animationId: string;
}

/**
 * Placeholder animation engine. Real Lottie/Rive assets aren't built yet, so
 * every interaction routes through here and plays a generic animated scene
 * using the interaction's icon + reaction text. When a real asset is dropped
 * in later, key off `animationId` (not the interaction type) to swap it — the
 * plumbing and DB rows already exist and won't need to change.
 *
 * Explicitly NOT "done": this is a placeholder by design for now.
 */
export function PlaceholderAnimation({ animationId }: PlaceholderAnimationProps) {
  const def: InteractionDef | undefined = INTERACTIONS.find(
    (i) => i.animationId === animationId,
  );
  const icon = def?.icon ?? "💞";
  const reaction = def?.reaction ?? "A little moment just happened. 💕";

  return (
    <motion.div
      className="flex flex-col items-center justify-center gap-4 p-8 text-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
    >
      <motion.div
        className="text-7xl"
        animate={{ y: [0, -12, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 1.4, repeat: 2 }}
      >
        {icon}
      </motion.div>
      <motion.p
        className="max-w-xs text-sm text-zinc-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {reaction}
      </motion.p>
      <span className="rounded-full bg-pink-100 px-3 py-1 text-xs font-medium text-pink-600">
        placeholder animation
      </span>
    </motion.div>
  );
}
