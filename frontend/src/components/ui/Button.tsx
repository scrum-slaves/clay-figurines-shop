import { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  fullWidth?: boolean;
};

const variantClasses = {
  primary:
    "border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--panel-bg)] hover:bg-[#34302b] hover:border-[#34302b]",
  secondary:
    "border-[var(--line-strong)] bg-white text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]",
  ghost:
    "border-transparent bg-transparent text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]",
};

export function Button({
  variant = "primary",
  fullWidth = false,
  className = "",
  type,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-full border px-5 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
        variantClasses[variant]
      } ${fullWidth ? "w-full" : ""} ${className}`}
      type={type ?? "button"}
      {...props}
    />
  );
}
