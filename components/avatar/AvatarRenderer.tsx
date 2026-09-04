import type { AvatarConfig } from "@/types";
import { layerOptions } from "@/lib/avatar/catalog";

interface AvatarRendererProps {
  config: AvatarConfig;
  size?: number;
  className?: string;
}

/**
 * Data-driven avatar renderer. Composites the five layers from the avatar
 * catalog config. Uses simple CSS/SVG shapes as placeholders until real
 * artwork assets are dropped in — the config shape won't change.
 */
export function AvatarRenderer({ config, size = 96, className = "" }: AvatarRendererProps) {
  const character = layerOptions("character").find((o) => o.id === config.character);
  const hair = layerOptions("hair").find((o) => o.id === config.hair);
  const face = layerOptions("face").find((o) => o.id === config.face);
  const accessory = layerOptions("accessory").find((o) => o.id === config.accessory);

  const c1 = character?.colors[0] ?? "#f0c27b";
  const c2 = character?.colors[1] ?? "#d2924f";
  const hasHair = hair && hair.id !== "bald";
  const hasAccessory = accessory && accessory.id !== "none";

  return (
    <div
      className={`relative select-none ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label="Your avatar"
    >
      <svg viewBox="0 0 100 100" width={size} height={size} className="block">
        <defs>
          <linearGradient id={`ch-${config.character}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c1} />
            <stop offset="100%" stopColor={c2} />
          </linearGradient>
        </defs>

        {/* Character head (base) */}
        <circle cx="50" cy="45" r="28" fill={`url(#ch-${config.character})`} />

        {/* Hair behind/on top of head */}
        {hasHair && hair ? (
          <g>
            <path
              d="M22 40c0-18 56-18 56 0v6c0-10-12-16-28-16S22 36 22 40z"
              fill={hair.colors[0]}
            />
            {hair.id === "pigtails" && (
              <>
                <circle cx="22" cy="50" r="8" fill={hair.colors[1]} />
                <circle cx="78" cy="50" r="8" fill={hair.colors[1]} />
              </>
            )}
            {hair.id === "long" && (
              <>
                <path d="M24 48c-4 16 4 22 6 26l6-4c-2-8 0-16 2-22z" fill={hair.colors[1]} />
                <path d="M76 48c4 16-4 22-6 26l-6-4c2-8 0-16-2-22z" fill={hair.colors[1]} />
              </>
            )}
          </g>
        ) : null}

        {/* Outfit: a simple jumper shape below the head */}
        <path d="M30 70l4 26h32l4-26c-4-8-36-8-40 0z" fill="#8a8f98" opacity="0.9" />

        {/* Face / eyes+mouth depending on face id */}
        <g fill="#2b2b2b">
          <circle cx="40" cy="45" r="3" />
          <circle cx="60" cy="45" r="3" />
          {face && (face.id === "wink") && <circle cx="40" cy="45" r="3" fill="#fff" opacity="0.5" />}
        </g>
        {face && face.id !== "grin" && (
          <path
            d="M44 52c2 3 10 3 12 0"
            stroke="#2b2b2b"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        )}
        {face && face.id === "grin" && (
          <path d="M40 52c4 6 16 6 20 0z" fill="#2b2b2b" />
        )}
        {face && face.id === "blush" && (
          <>
            <circle cx="34" cy="50" r="3" fill="#ff8fab" opacity="0.7" />
            <circle cx="66" cy="50" r="3" fill="#ff8fab" opacity="0.7" />
          </>
        )}

        {/* Accessory */}
        {hasAccessory && accessory ? (
          <g>
            {(accessory.id === "glasses") && (
              <>
                <circle cx="40" cy="45" r="6" fill="none" stroke="#2b2b2b" strokeWidth="1.5" />
                <circle cx="60" cy="45" r="6" fill="none" stroke="#2b2b2b" strokeWidth="1.5" />
                <line x1="46" y1="45" x2="54" y2="45" stroke="#2b2b2b" strokeWidth="1.5" />
              </>
            )}
            {(accessory.id === "crown") && (
              <path d="M34 30l8-14 8 8 8-8 8 14-32 0z" fill={accessory.colors[0]} />
            )}
            {(accessory.id === "scarf") && (
              <path d="M36 62l4 14h20l4-14c-9-6-19-6-28 0z" fill={accessory.colors[0]} />
            )}
            {(accessory.id === "bow") && (
              <g transform="translate(50 30)">
                <path d="M-8 0c-4-7-12-6-12 0s8 7 12 0z" fill={accessory.colors[0]} />
                <path d="M8 0c4-7 12-6 12 0s-8 7-12 0z" fill={accessory.colors[0]} />
                <circle r="3" fill={accessory.colors[1]} />
              </g>
            )}
          </g>
        ) : null}
      </svg>
    </div>
  );
}
