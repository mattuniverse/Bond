"use client";

import { useRef, useState, useTransition } from "react";

import { AVATAR_LAYERS, DEFAULT_AVATAR } from "@/lib/avatar/catalog";
import type { AvatarConfig, AvatarLayer } from "@/types";
import { AvatarRenderer } from "@/components/avatar/AvatarRenderer";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { saveAndContinue, saveAvatar } from "@/lib/avatar/actions";

interface AvatarBuilderProps {
  initial?: Partial<Record<AvatarLayer, string>> | null;
  onSaved?: () => void;
}

export function AvatarBuilder({ initial, onSaved }: AvatarBuilderProps) {
  const [config, setConfig] = useState<AvatarConfig>({
    character: initial?.character ?? DEFAULT_AVATAR.character,
    face: initial?.face ?? DEFAULT_AVATAR.face,
    hair: initial?.hair ?? DEFAULT_AVATAR.hair,
    outfit: initial?.outfit ?? DEFAULT_AVATAR.outfit,
    accessory: initial?.accessory ?? DEFAULT_AVATAR.accessory,
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const errorRef = useRef<HTMLDivElement>(null);

  function setLayer(layer: AvatarLayer, value: string) {
    setError(null);
    setConfig((prev) => ({ ...prev, [layer]: value }));
  }

  async function handleSave() {
    setError(null);
    const res = await saveAvatar(config);
    if (res?.error) {
      setError(res.error);
      errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      onSaved?.();
    }
  }

  async function handleSaveAndContinue() {
    setError(null);
    startTransition(async () => {
      try {
        await saveAndContinue(config);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't save. Try again. 🙈");
      }
    });
  }

  return (
    <div className="grid gap-8 md:grid-cols-[minmax(240px,1fr)_1.5fr]">
      <div className="order-2 md:order-1">
        <div className="flex flex-col gap-4">
          {AVATAR_LAYERS.map((layer) => (
            <div key={layer.key}>
              <p className="mb-2 text-sm font-semibold text-zinc-700">{layer.label}</p>
              <div className="flex flex-wrap gap-2">
                {layer.options.map((option) => {
                  const selected = config[layer.key] === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setLayer(layer.key, option.id)}
                      className={`flex flex-col items-center gap-1 rounded-xl border px-3 py-2 text-sm transition-all ${
                        selected
                          ? "border-pink-500 bg-pink-50 text-pink-700"
                          : "border-zinc-200 bg-white text-zinc-600 hover:border-pink-200"
                      }`}
                    >
                      <span className="text-lg" aria-hidden>
                        {option.emoji}
                      </span>
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="order-1 flex flex-col items-center justify-center gap-4 md:order-2">
        <div className="flex h-56 w-56 items-center justify-center rounded-3xl border border-pink-100 bg-white shadow-lg shadow-pink-100/50">
          <AvatarRenderer config={config} size={180} />
        </div>

        <div ref={errorRef} className="w-full max-w-xs">
          {error && <Alert>{error}</Alert>}
        </div>

        <div className="flex w-full max-w-xs gap-3">
          {onSaved && (
            <Button className="flex-1" onClick={handleSave} disabled={pending}>
              Save
            </Button>
          )}
          <Button
            className="flex-1"
            onClick={handleSaveAndContinue}
            loading={pending}
          >
            {onSaved ? "Save & continue" : "Save & done"}
          </Button>
        </div>
      </div>
    </div>
  );
}
