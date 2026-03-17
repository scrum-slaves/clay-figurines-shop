import { ReactNode } from "react";

type PageContainerProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function PageContainer({
  eyebrow,
  title,
  description,
  actions,
  children,
}: PageContainerProps) {
  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-6 border-b border-[var(--line)] pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
              {eyebrow}
            </p>
          ) : null}
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold uppercase tracking-[0.05em] text-[var(--text-primary)] lg:text-5xl">
              {title}
            </h1>
            {description ? (
              <p className="max-w-2xl text-sm leading-6 text-[var(--text-muted)] lg:text-base">{description}</p>
            ) : null}
          </div>
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
      </header>
      {children}
    </section>
  );
}
