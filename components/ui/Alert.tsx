import type { ReactNode } from "react";

interface AlertProps {
  tone?: "error" | "info" | "success";
  children: ReactNode;
}

export function Alert({ tone = "error", children }: AlertProps) {
  const tones = {
    error: "border-rose-200 bg-rose-50 text-rose-700",
    info: "border-pink-200 bg-pink-50 text-pink-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  } as const;

  if (!children) return null;

  return (
    <p className={`rounded-xl border px-4 py-3 text-sm leading-relaxed ${tones[tone]}`}>
      {children}
    </p>
  );
}
