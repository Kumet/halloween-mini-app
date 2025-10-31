import { useTranslation } from 'react-i18next';

export default function ResultBadge({ kind }: { kind: 'treat' | 'trick' }) {
  const { t } = useTranslation();
  const text = kind === 'treat' ? t('motion.badgeTreat') : t('motion.badgeTrick');
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm border ${kind==='treat' ? 'border-green-400' : 'border-orange-400'}`}>
      {text}
    </span>
  );
}
