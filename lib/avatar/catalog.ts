import type { AvatarLayer } from "@/types";

export interface LayerOption {
  id: string;
  label: string;
  emoji: string;
  /** Tailwind gradient/shape tokens used for the placeholder renderer. */
  colors: [string, string];
}

export interface LayerCatalog {
  key: AvatarLayer;
  label: string;
  options: LayerOption[];
}

/**
 * Layered avatar catalog. Every layer has a handful of options; the renderer
 * composites them by key, so adding a new option (or new layer) needs no new
 * component — just data.
 */
export const AVATAR_LAYERS: LayerCatalog[] = [
  {
    key: "character",
    label: "Character",
    options: [
      { id: "bear", label: "Bear", emoji: "🟤", colors: ["#b97a4f", "#8a5530"] },
      { id: "bunny", label: "Bunny", emoji: "🐇", colors: ["#f4e6f0", "#e0b7d0"] },
      { id: "cat", label: "Cat", emoji: "🐱", colors: ["#f0c27b", "#d2924f"] },
      { id: "fox", label: "Fox", emoji: "🦊", colors: ["#f2784b", "#c94f2a"] },
      { id: "panda", label: "Panda", emoji: "🐼", colors: ["#efefef", "#3a3a3a"] },
    ],
  },
  {
    key: "face",
    label: "Face",
    options: [
      { id: "happy", label: "Happy", emoji: "🙂", colors: ["#3a3a3a", "#3a3a3a"] },
      { id: "blush", label: "Blush", emoji: "😊", colors: ["#ff8fab", "#ff8fab"] },
      { id: "sleepy", label: "Sleepy", emoji: "😴", colors: ["#8a8a8a", "#8a8a8a"] },
      { id: "grin", label: "Grin", emoji: "😁", colors: ["#3a3a3a", "#3a3a3a"] },
      { id: "wink", label: "Wink", emoji: "😉", colors: ["#3a3a3a", "#3a3a3a"] },
    ],
  },
  {
    key: "hair",
    label: "Hair",
    options: [
      { id: "bald", label: "None", emoji: "🚫", colors: ["#00000000", "#00000000"] },
      { id: "short", label: "Short", emoji: "✂️", colors: ["#6b4f3a", "#4a3426"] },
      { id: "long", label: "Long", emoji: "🦱", colors: ["#5a3d2b", "#372416"] },
      { id: "curly", label: "Curly", emoji: "🦱", colors: ["#3a2a1a", "#24180e"] },
      { id: "pigtails", label: "Pigtails", emoji: "🎀", colors: ["#8a4a3a", "#5f2f22"] },
    ],
  },
  {
    key: "outfit",
    label: "Outfit",
    options: [
      { id: "tee", label: "Tee", emoji: "👕", colors: ["#6aa5ff", "#3f7fe0"] },
      { id: "hoodie", label: "Hoodie", emoji: "🧥", colors: ["#8a8f98", "#5c6169"] },
      { id: "dress", label: "Dress", emoji: "👗", colors: ["#ff8fb1", "#e0578a"] },
      { id: "overalls", label: "Overalls", emoji: "👖", colors: ["#7d8a4a", "#55602e"] },
    ],
  },
  {
    key: "accessory",
    label: "Accessory",
    options: [
      { id: "none", label: "None", emoji: "🚫", colors: ["#00000000", "#00000000"] },
      { id: "scarf", label: "Scarf", emoji: "🧣", colors: ["#ff5c5c", "#cc3333"] },
      { id: "glasses", label: "Glasses", emoji: "👓", colors: ["#2b2b2b", "#2b2b2b"] },
      { id: "crown", label: "Crown", emoji: "👑", colors: ["#ffd54f", "#c9a227"] },
      { id: "bow", label: "Bow", emoji: "🎀", colors: ["#ff7ba9", "#e04a82"] },
    ],
  },
];

export const DEFAULT_AVATAR: Record<AvatarLayer, string> = {
  character: "cat",
  face: "happy",
  hair: "short",
  outfit: "tee",
  accessory: "none",
};

export function layerOptions(layer: AvatarLayer): LayerOption[] {
  return AVATAR_LAYERS.find((l) => l.key === layer)?.options ?? [];
}
