export default function ResultBadge({ kind }: { kind: 'treat' | 'trick' }) {
  const text = kind === 'treat' ? 'TREAT! 🍬' : 'TRICK! 👻';
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm border ${kind==='treat' ? 'border-green-400' : 'border-orange-400'}`}>
      {text}
    </span>
  );
}
