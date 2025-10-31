import type { ButtonHTMLAttributes } from 'react';

export default function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`px-4 py-2 rounded-xl border border-zinc-700 hover:bg-zinc-800 active:scale-95 transition ${props.className ?? ''}`}
    />
  );
}
