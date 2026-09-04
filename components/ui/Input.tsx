import * as React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
};

export function Input({ label, hint, className = "", id, ...props }: InputProps) {
  const inputId = id ?? props.name;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium uppercase tracking-widest text-[#9C8878]">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`border-0 border-b border-[#C4A882] rounded-none bg-transparent px-0 py-2.5 text-sm text-zinc-900 placeholder:text-[#B8A898] focus:border-[#2C1A0E] focus:outline-none focus:ring-0 ${className}`}
        {...props}
      />
      {hint && <p className="text-xs text-[#B8A898]">{hint}</p>}
    </div>
  );
}
