import { ReactNode } from "react";

type StatusCardProps = {
  title: string;
  description?: string;
  tone?: "default" | "error" | "warning" | "success";
  action?: ReactNode;
  className?: string;
};

const toneClasses = {
  default: "border-[var(--line)] bg-white text-[var(--text-primary)]",
  error: "border-[#d7b3ae] bg-[#fff1ef] text-[#7b2d21]",
  warning: "border-[#dfcfb1] bg-[#fff8ea] text-[#7f5c1e]",
  success: "border-[#b8d5c4] bg-[#f0fbf4] text-[#21573a]",
};

export function StatusCard({
  title,
  description,
  tone = "default",
  action,
  className = "",
}: StatusCardProps) {
  return (
    <div className={`rounded-[28px] border px-6 py-6 ${toneClasses[tone]} ${className}`}>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        {description ? <p className="max-w-xl text-sm leading-6 opacity-85">{description}</p> : null}
      </div>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
