import * as React from "react";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-[#E8DACE] bg-[#FDFAF6] p-6 ${className}`}
      {...props}
    />
  );
}
