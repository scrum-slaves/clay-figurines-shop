type LoadingBlockProps = {
  className?: string;
};

export function LoadingBlock({ className = "" }: LoadingBlockProps) {
  return <div className={`animate-pulse rounded-[28px] bg-[var(--surface-secondary)] ${className}`} />;
}
