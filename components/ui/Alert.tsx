import type { ReactNode } from "react";

interface AlertProps {
  tone?: "error" | "info" | "success";
  children: ReactNode;
}

export function Alert({ tone = "error", children }: AlertProps) {
  const tones = {
    error: "border-[#E8CECE] bg-[#FDF5F5] text-[#8B3A3A]",
    info: "border-[#E8DACE] bg-[#FDF8F2] text-[#7A5C3A]",
    success: "border-[#C8DEC8] bg-[#F5FDF5] text-[#3A6B3A]",
  } as const;

  if (!children) return null;

  return (
    <p className={`rounded-xl border px-4 py-3 text-sm leading-relaxed ${tones[tone]}`}>
      {children}
    </p>
  );
}
