import * as React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C4A882] disabled:opacity-60 disabled:cursor-not-allowed";
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3.5 text-base",
  };
  const variants = {
    primary: "bg-[#2C1A0E] text-white hover:bg-[#3D2314]",
    secondary: "border border-[#C4A882] bg-transparent text-[#2C1A0E] hover:bg-[#F0E6D8]",
    ghost: "text-[#2C1A0E] hover:bg-[#F0E6D8]",
    danger: "bg-[#F5E6E6] text-[#8B3A3A] hover:bg-[#EDD5D5]",
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      )}
      {children}
    </button>
  );
}
