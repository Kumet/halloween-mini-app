import type { ReactNode } from 'react';

export default function Card({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-5 shadow-xl">
      {children}
    </div>
  );
}
