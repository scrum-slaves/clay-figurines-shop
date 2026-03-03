import { ReactNode } from "react";


type PageContainerProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};


export function PageContainer({ title, subtitle, children }: PageContainerProps) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-stone-900">{title}</h1>
        {subtitle ? <p className="text-sm text-stone-600">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}
