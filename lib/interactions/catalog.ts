import type { InteractionDef } from "@/types";

/**
 * Single source of truth for interactions. Driven by data, not by a component
 * per interaction. `placeholder: true` means the real animation asset isn't
 * built yet; the plumbing still works and we say so explicitly.
 */
export const INTERACTIONS: InteractionDef[] = [
  {
    id: "hug",
    name: "Hug",
    category: "affection",
    icon: "🤗",
    animationId: "placeholder_hug",
    reaction: "They snuggle in close and everything feels warmer.",
    placeholder: true,
  },
  {
    id: "wave",
    name: "Wave",
    category: "wave",
    icon: "👋",
    animationId: "placeholder_wave",
    reaction: "They wave back with a big grin.",
    placeholder: true,
  },
  {
    id: "high_five",
    name: "High Five",
    category: "celebration",
    icon: "✋",
    animationId: "placeholder_high_five",
    reaction: "Smack! They return the high five.",
    placeholder: true,
  },
  {
    id: "thumbs_up",
    name: "Thumbs Up",
    category: "celebration",
    icon: "👍",
    animationId: "placeholder_thumbs_up",
    reaction: "They give a double thumbs up.",
    placeholder: true,
  },
  {
    id: "forehead_kiss",
    name: "Forehead Kiss",
    category: "affection",
    icon: "💋",
    animationId: "placeholder_forehead_kiss",
    reaction: "They lean in for a gentle forehead kiss.",
    placeholder: true,
  },
  {
    id: "cheek_kiss_l",
    name: "Cheek Kiss (L)",
    category: "affection",
    icon: "😚",
    animationId: "placeholder_cheek_kiss_l",
    reaction: "A soft kiss lands on your left cheek.",
    placeholder: true,
  },
  {
    id: "cheek_kiss_r",
    name: "Cheek Kiss (R)",
    category: "affection",
    icon: "😘",
    animationId: "placeholder_cheek_kiss_r",
    reaction: "A soft kiss lands on your right cheek.",
    placeholder: true,
  },
  {
    id: "head_pat",
    name: "Head Pat",
    category: "care",
    icon: "🫳",
    animationId: "placeholder_head_pat",
    reaction: "They gently pat your head. It's comforting.",
    placeholder: true,
  },
  {
    id: "nose_boop",
    name: "Nose Boop",
    category: "play",
    icon: "👉",
    animationId: "placeholder_nose_boop",
    reaction: "Boop! They tap your nose and giggle.",
    placeholder: true,
  },
];

export function getInteraction(id: string): InteractionDef | undefined {
  return INTERACTIONS.find((i) => i.id === id);
}

export function isKnownInteraction(id: string): boolean {
  return INTERACTIONS.some((i) => i.id === id);
}

/** MVP set for Phase 4 (Hug, Wave, High Five, Thumbs Up). */
export const MVP_IDS = new Set(["hug", "wave", "high_five", "thumbs_up"]);
